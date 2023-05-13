import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Alarm, Device, Path, SessionStatus, UserInfo } from '../type'
//import WebSocket from 'tauri-plugin-websocket-api'
import { sleep, urlEnds } from '../utils'
import useLogIn from './loginStore'
import useAlarms from './alarmStore'
import useDevices from './deviceStore'
import { useAudio } from '../stores'

type wsActionMsg = {
  url?: string,
  mode?: string,
}
enum WsMessage {
  AlarmAdd = "alarmAdd",
  AlarmDelete = "alarmDelete",
  AlarmEdit = "alarmEdit",
  DeviceAdd = "deviceAdd",
  DeviceDelete = "deviceDelete",
  DeviceEdit = "deviceEdit",
  UserEdit = "userEdit"
}
type wsRegisterMsg = {
  formPass : boolean,
  password: string,
  guesses: number,
  score: number,
  serverMinimum: number,
  feedBack: Array<string>
}

type UseServer = {
    address : string,
    wsAddress: string,
    wsAction: string,
    wsRegister: string,
    extended: string,
    wsActionConnection: WebSocket|null,
    wsActionMessage: wsActionMsg|null,
    wsRegisterConnection: WebSocket|null,
    wsRegisterMessage: wsRegisterMsg|null,
    setWsActionConnection: (ws: WebSocket|null) => void,
    setWSActionMessage: (message: wsActionMsg|null) => void,
    wsActionConnect: () => void,
    setWsRegisterConnection: (ws: WebSocket|null) => void,
    setWSRegisterMessage: (message: wsRegisterMsg|null) => void,
    wsRegisterConnect: () => void,
    wsRegisterDisconnect: () => void,
    wsRegisterSendMessage: (message: string) => void,
    extend: (part: Path) => string,
    setAddress : (input:string) => void
}

function getDefaultAddress() {
  const metaAddress = document.head.querySelector("[property~=server][address]")?.attributes.getNamedItem("address")?.value
  const baseAddress = (metaAddress) ? metaAddress : "http://localhost:3001"
  const metaExtend = document.head.querySelector("[property~=url][extend]")?.attributes.getNamedItem("extend")?.value
  const baseExtend = (metaExtend) ? metaExtend : ""
  return { base: baseAddress, extend: baseExtend }
}
function websocketAddress(server: string) {
  let base = server.split("://")
  if (base[0] === "https") {
    return "wss://" + base[1]
  }
  return "ws://" + base[1]
}

function filterUniqueIds<T extends Device|Alarm>(array: Array<T>):Array<T> {
  return array.filter((array, index, self) =>
    index === self.findIndex((t) => (
      t.id === array.id
    ))
  )
}

function alarmAdd(alarm: Alarm) {
  let alarms = useAlarms.getState().alarms
  alarms.push(alarm)
  //only unique alarms
  alarms = filterUniqueIds(alarms)
  useAlarms.setState({ alarms: [...alarms] })
}
function alarmDelete(id: string) {
  let alarms = useAlarms.getState().alarms
  let filtered = alarms.filter((alarm) => alarm.id !== id)
  useAlarms.setState({ alarms: [...filtered] })
}

function alarmEdit(alarm: Alarm) {
  let alarms = useAlarms.getState().alarms
  let filtered = alarms.filter((a) => a.id !== alarm.id)
  filtered.push(alarm)
  //check if the aram is playing in the background and stop it
  let playing = useAudio.getState().plays
  //check URL Path
  if(urlEnds(Path.PlayAlarm) && playing ){
    if (useAudio.getState().playingAlarm === alarm.id){
      useAudio.getState().stop()
      useLogIn.getState().setNavigateTo(Path.Alarms)
    }
  }
  useAlarms.setState({ alarms: [...filtered] })
}


function deviceAdd(device: Device) {
  let devices = useDevices.getState().devices
  devices.push(device)
  //only unique devices
  devices = filterUniqueIds(devices)
  useDevices.setState({ devices: [...devices] })
}

function deviceDelete(id: string) {
  let devices = useDevices.getState().devices
  let filtered = devices.filter((device) => device.id !== id)
  useDevices.setState({ devices: [...filtered] })
}

function deviceEdit(device: Device) {
  let devices = useDevices.getState().devices
  let filtered = devices.filter((d) => d.id !== device.id)
  filtered.push(device)

  useDevices.setState({ devices: [...filtered] })
}
function userEdit(user: UserInfo) {
  useLogIn.setState({ user: user })
}

function wsActionListener(data: any) {
  //console.log(data)
  if (typeof data === 'object') {
    try {
      if (data.hasOwnProperty('type') && data.hasOwnProperty('data')) {
        let dataType = data.type as WsMessage
        switch (dataType) {
          case WsMessage.AlarmAdd:
            alarmAdd(data.data as Alarm)
            break
          case WsMessage.AlarmDelete:
            alarmDelete(data.data as string)
            break
          case WsMessage.AlarmEdit:
            alarmEdit(data.data as Alarm)
            break
          case WsMessage.DeviceAdd:
            deviceAdd(data.data as Device)
            break
          case WsMessage.DeviceDelete:
            deviceDelete(data.data as string)
            break
          case WsMessage.DeviceEdit:
            deviceEdit(data.data as Device)
            break
          case WsMessage.UserEdit:
            userEdit(data.data as UserInfo)
            break
          default:
            break
        }
      }
    } catch (e) {
      useServer.getState().wsActionConnection?.close()
      useServer.getState().setWsActionConnection(null)
    } 
  }
}


async function registerConnecting() {
  if(!urlEnds(Path.Register)){
    useServer.getState().wsActionConnection?.close()
    return null
  }
  await sleep(200)
  if(!useServer.getState().wsRegisterConnection){
    let ws  = new WebSocket(useServer.getState().wsRegister)
    ws.onmessage = (event : MessageEvent) => {
      try{
        useServer.getState().setWSRegisterMessage(JSON.parse(event.data))
      }catch(e){
        //console.log(e)
      }    
    }
    ws.onclose = (event : CloseEvent) => {
      useServer.getState().setWsRegisterConnection(null)
    }
    return ws
  }
  return useServer.getState().wsRegisterConnection
}


async function checkIfConnected() {
  let conn = useServer.getState().wsActionConnection
  if (conn) {
    conn.send("test")
    await sleep(2000)
    conn.send("test")
    await sleep(200)
    if (conn.readyState === 1) {
      return true
    }
  }
  return false
}
async function onOpenRoutine(ws: WebSocket) {
  if (!checkIfConnected){
    return
  }
  await sleep(1000)
  //check if ws is still open
  if (ws.readyState !== 1) {
    return
  }

  ws.send(useLogIn.getState().wsPair)
  useLogIn.getState().updateState()
}

function actionConnecting() {
  if (useLogIn.getState().token.length < 10) {
    return null
  }
  if(useLogIn.getState().sessionValid === SessionStatus.Activate){
    return null
  }
  let wsToken =  useLogIn.getState().getWsToken()
  if (!wsToken || wsToken.length < 10) {
    return null
  }
  let socketAddress = `${useServer.getState().wsAction}/${wsToken}`
  let ws = new WebSocket(socketAddress)
  ws.onopen = (event: Event) => {
    onOpenRoutine(ws)
  }
  ws.onmessage = (event: MessageEvent) => {
    try {
      wsActionListener(JSON.parse(event.data))
    } catch (e) {

    }
    try {
      ws.send(".")
    } catch (e) { }
  }
  ws.onerror = (event: Event) => {

  }
  ws.onclose = (event: CloseEvent) => {
    ws.removeEventListener("message", wsActionListener)
 
  }
  return ws
}


const useServer = create<UseServer>()(
    persist(
      (set, get) => (
          {
            address: getDefaultAddress().base,
            wsAddress: websocketAddress(getDefaultAddress().base),
            wsAction: websocketAddress(getDefaultAddress().base) + '/action',
            wsRegister: websocketAddress(getDefaultAddress().base) + '/register-check',
            wsActionConnection: null,
            wsActionMessage: null,
            wsRegisterConnection: null,
            wsRegisterMessage: null,
            wsRegisterConnect: async () => {
              let ws = await registerConnecting()
              set(
                  {
                    wsRegisterConnection: ws
                  }
                )
            },
            wsRegisterDisconnect: () => {
              get().wsRegisterConnection?.close()
              set(
                  {
                    wsRegisterConnection: null,
                  }
                )
            },
            setWsRegisterConnection: (ws) => set({wsRegisterConnection: ws}),
            setWSRegisterMessage: (message) => set({wsRegisterMessage: message}),
            wsRegisterSendMessage: (message) => { 
              get().wsRegisterConnection?.send(message)
            },
            setWsActionConnection: (ws) => set({wsActionConnection: ws}),
            setWSActionMessage: (message) => set({wsActionMessage: message}),
            wsActionConnect: async () => {
              let wsAction = get().wsActionConnection
              let continueConnecting = true
              if (wsAction) {
                continueConnecting =  [0,1].includes(wsAction.readyState)
              }else{
                continueConnecting = false
              }
              if (continueConnecting) {
                return
              }
              let ws =  actionConnecting()
              set(
                {
                  wsActionConnection: ws,
                }
              )
            },
            setAddress: (s) => set(
                  { 
                    address: s,
                    wsAddress: websocketAddress(s),
                    wsAction: websocketAddress(s) + '/action',
                    wsRegister: websocketAddress(s) + '/register-check'
                  }
            ),
            extended: getDefaultAddress().extend,
            extend: (part) => {
               return `${get().extended}/${part}`
            },
          }
      ),
      {
          name: 'server', 
          storage: createJSONStorage(() => localStorage), 
          partialize: (state) => (
              { 
                address: state.address,
                wsAddress: state.wsAddress,
                wsAction: state.wsAction,
                wsRegister: state.wsRegister
              }
          ),
      }
    )
)

async function actionChecker(){
  while(true){
    await sleep(500)
    let conn = useServer.getState().wsActionConnection
    if (conn){
      if (![0,1].includes(conn.readyState)){
        useServer.getState().wsActionConnect()
      }
    } else {
      useServer.getState().wsActionConnect()
    }
    await sleep(15000)
  }
}
actionChecker()


export default useServer
