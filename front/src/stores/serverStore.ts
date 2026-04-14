import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { Alarm, Device, Path, SessionStatus, UserInfo } from '../type'
import { urlEnds, sleep } from '../utils'
import { defaultWebColors, UserColors } from './settingsStore'
// circular import — safe: useStore only accessed inside function bodies after init
import { useStore } from './store'

type wsActionMsg  = { url?: string; mode?: string }
type wsRegisterMsg = {
    formPass:      boolean
    password:      string
    guesses:       number
    score:         number
    serverMinimum: number
    feedBack:      Array<string>
}

enum Proto {
    Http  = "http",
    Https = "https"
}

enum WsMessage {
    AlarmAdd    = "alarmAdd",
    AlarmDelete = "alarmDelete",
    AlarmEdit   = "alarmEdit",
    DeviceAdd   = "deviceAdd",
    DeviceDelete= "deviceDelete",
    DeviceEdit  = "deviceEdit",
    UserEdit    = "userEdit",
    WebColors   = "webColors"
}

export interface ServerSlice {
    address:             string
    wsAddress:           string
    wsAction:            string
    wsRegister:          string
    extended:            string
    wsActionConnection:  WebSocket | null
    wsActionMessage:     wsActionMsg | null
    wsRegisterConnection:WebSocket | null
    wsRegisterMessage:   wsRegisterMsg | null
    proto:               Proto
    setProto:                (s: Proto) => void
    setWsActionConnection:   (ws: WebSocket | null) => void
    wsActionDisconnect:      () => void
    setWSActionMessage:      (message: wsActionMsg | null) => void
    wsActionConnect:         () => void
    setWsRegisterConnection: (ws: WebSocket | null) => void
    setWSRegisterMessage:    (message: wsRegisterMsg | null) => void
    wsRegisterConnect:       () => void
    wsRegisterDisconnect:    () => void
    wsRegisterSendMessage:   (message: string) => void
    extend:                  (part: Path) => string
    setAddress:              (input: string) => void
}

function getDefaultAddress() {
    const metaAddress = document.head.querySelector("[property~=server][address]")?.attributes.getNamedItem("address")?.value
    const baseAddress = metaAddress ?? "http://localhost:3001"
    const metaExtend  = document.head.querySelector("[property~=url][extend]")?.attributes.getNamedItem("extend")?.value
    const baseExtend  = metaExtend ?? ""
    const proto       = baseAddress.split("://")[0] as Proto
    return { base: baseAddress, extend: baseExtend, proto }
}

function websocketAddress(server: string) {
    const base = server.split("://")
    return base[0] === "https" ? "wss://" + base[1] : "ws://" + base[1]
}

function filterUniqueIds<T extends Device | Alarm>(array: Array<T>): Array<T> {
    return array.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id)
    )
}

function wsActionListener(data: unknown) {
    if (typeof data !== 'object' || data === null) return
    if (!('type' in data) || !('data' in data)) return
    const msg = data as { type: string; data: unknown }
    try {
        const dataType = msg.type as WsMessage
        switch (dataType) {
            case WsMessage.AlarmAdd: {
                const alarm  = msg.data as Alarm
                const alarms = filterUniqueIds([...useStore.getState().alarms, alarm])
                useStore.setState({ alarms: [...alarms] })
                break
            }
            case WsMessage.AlarmDelete: {
                const id = msg.data as string
                useStore.setState({ alarms: useStore.getState().alarms.filter(a => a.id !== id) })
                break
            }
            case WsMessage.AlarmEdit: {
                const alarm   = msg.data as Alarm
                const alarms  = useStore.getState().alarms.filter(a => a.id !== alarm.id)
                alarms.push(alarm)
                if (urlEnds(Path.PlayAlarm) && useStore.getState().plays) {
                    if (useStore.getState().playingAlarm === alarm.id) {
                        useStore.getState().stop()
                        useStore.getState().setNavigateTo(Path.Alarms)
                    }
                }
                useStore.setState({ alarms: [...alarms] })
                break
            }
            case WsMessage.DeviceAdd: {
                const device  = msg.data as Device
                const devices = filterUniqueIds([...useStore.getState().devices, device])
                const viewable = useStore.getState().viewableDevices
                useStore.getState().setViewableDevices([...viewable, device.id])
                useStore.setState({ devices: [...devices] })
                break
            }
            case WsMessage.DeviceDelete: {
                const id      = data.data as string
                const devices = useStore.getState().devices.filter(d => d.id !== id)
                useStore.setState({ devices: [...devices] })
                const viewable = useStore.getState().viewableDevices.filter(v => v !== id)
                useStore.getState().setViewableDevices([...viewable])
                break
            }
            case WsMessage.DeviceEdit: {
                const device  = msg.data as Device
                const devices = useStore.getState().devices.filter(d => d.id !== device.id)
                devices.push(device)
                useStore.setState({ devices: [...devices] })
                break
            }
            case WsMessage.UserEdit: {
                useStore.setState({ user: msg.data as UserInfo })
                break
            }
            case WsMessage.WebColors: {
                const cols         = msg.data as UserColors
                const defaultColors = defaultWebColors()
                useStore.setState({ webColors: { ...defaultColors, ...cols } })
                break
            }
            default:
                break
        }
    } catch (e) {
        useStore.getState().wsActionConnection?.close()
        useStore.getState().setWsActionConnection(null)
    }
}

async function registerConnecting() {
    if (!urlEnds(Path.Register)) {
        useStore.getState().wsActionConnection?.close()
        return null
    }
    await sleep(200)
    if (!useStore.getState().wsRegisterConnection) {
        const ws = new WebSocket(useStore.getState().wsRegister)
        ws.onmessage = (event: MessageEvent) => {
            try { useStore.getState().setWSRegisterMessage(JSON.parse(event.data)) } catch {}
        }
        ws.onclose = () => { useStore.getState().setWsRegisterConnection(null) }
        return ws
    }
    return useStore.getState().wsRegisterConnection
}

async function onOpenRoutine(ws: WebSocket) {
    if (!checkIfConnected) return
    await sleep(1000)
    if (ws.readyState !== 1) return
    ws.send(useStore.getState().wsPair)
    useStore.getState().updateState()
}

function actionConnecting() {
    const state = useStore.getState()
    if (state.token.length < 10) return null
    if (state.sessionValid === SessionStatus.Activate) return null
    const wsToken = state.getWsToken()
    if (!wsToken || wsToken.length < 10) return null
    const socketAddress = `${state.wsAction}/${wsToken}`
    const ws = new WebSocket(socketAddress)
    ws.onopen    = () => { onOpenRoutine(ws) }
    ws.onmessage = (event: MessageEvent) => {
        try { wsActionListener(JSON.parse(event.data)) } catch {}
        try { ws.send(".") } catch {}
    }
    ws.onerror = () => {}
    ws.onclose = () => { ws.removeEventListener("message", wsActionListener) }
    return ws
}

async function checkIfConnected() {
    const conn = useStore.getState().wsActionConnection
    if (conn) {
        conn.send("test")
        await sleep(2000)
        conn.send("test")
        await sleep(200)
        if (conn.readyState === 1) return true
    }
    return false
}

// Daemon — exported so store.ts can call it after create()
export async function actionChecker() {
    while (true) {
        await sleep(15000)
        const conn = useStore.getState().wsActionConnection
        if (conn) {
            if (![0, 1].includes(conn.readyState)) {
                useStore.getState().wsActionConnect()
            }
        } else {
            useStore.getState().wsActionConnect()
        }
    }
}

const defaults = getDefaultAddress()

export const createServerSlice: StateCreator<BoundStore, [], [], ServerSlice> = (set, get) => ({
    address:              defaults.base,
    wsAddress:            websocketAddress(defaults.base),
    wsAction:             websocketAddress(defaults.base) + '/action',
    wsRegister:           websocketAddress(defaults.base) + '/register-check',
    extended:             defaults.extend,
    wsActionConnection:   null,
    wsActionMessage:      null,
    wsRegisterConnection: null,
    wsRegisterMessage:    null,
    proto:                defaults.proto,

    setProto: (s) => set({ proto: s }),

    wsActionDisconnect: () => {
        get().wsActionConnection?.close()
        set({ wsActionConnection: null })
    },

    wsRegisterConnect: async () => {
        const ws = await registerConnecting()
        set({ wsRegisterConnection: ws })
    },

    wsRegisterDisconnect: () => {
        get().wsRegisterConnection?.close()
        set({ wsRegisterConnection: null })
    },

    setWsRegisterConnection: (ws) => set({ wsRegisterConnection: ws }),
    setWSRegisterMessage:    (message) => set({ wsRegisterMessage: message }),
    wsRegisterSendMessage:   (message) => get().wsRegisterConnection?.send(message),

    setWsActionConnection: (ws) => set({ wsActionConnection: ws }),
    setWSActionMessage:    (message) => set({ wsActionMessage: message }),

    wsActionConnect: () => {
        console.log("Reconnecting")
        const wsAction = get().wsActionConnection
        let continueConnecting = true
        if (wsAction) {
            continueConnecting = [0, 1].includes(wsAction.readyState)
        } else {
            continueConnecting = false
        }
        if (continueConnecting) return
        const ws = actionConnecting()
        set({ wsActionConnection: ws })
    },

    setAddress: (s) => set({
        address:   s,
        wsAddress: websocketAddress(s),
        wsAction:  websocketAddress(s) + '/action',
        wsRegister: websocketAddress(s) + '/register-check',
        proto:     s.split("://")[0] as Proto,
    }),

    extend: (part) => `${get().extended}/${part}`,
})
