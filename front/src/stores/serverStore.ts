import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Alarm, Device, Path, SessionStatus, UserInfo } from '../type'
import { urlEnds, sleep } from '../utils'
import useLogIn from './loginStore'
import useAlarms from './alarmStore'
import useDevices from './deviceStore'
import useAudio from './audioStore'

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
export interface Content {
  guesses: number,
  score: number,
  serverMinimum: number
}
export enum Query {
  ZXCVBN = "zxcvbn",
  Form = "form"
}
type wsRegisterMsg = {
  content: Content | boolean,
  type: Query
}

type UseServer = {
  address: string,
  wsAddress: string,
  wsAction: string,
  wsRegister: string,
  extended: string,
  wsActionConnection: WebSocket | null,
  wsActionMessage: wsActionMsg | null,
  wsRegisterConnection: WebSocket | null,
  wsRegisterMessage: wsRegisterMsg | null,
  setWsActionConnection: (ws: WebSocket | null) => void,
  setWSActionMessage: (message: wsActionMsg | null) => void,
  wsActionConnect: () => void,
  setWsRegisterConnection: (ws: WebSocket | null) => void,
  setWSRegisterMessage: (message: wsRegisterMsg | null) => void,
  wsRegisterConnect: () => void,
  wsRegisterDisconnect: () => void,
  wsRegisterSendMessage: (message: string) => void,
  extend: (part: Path) => string,
  setAddress: (input: string) => void
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
function filterUniqueIds(array: Array<any>) {
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
    //check the id of playing alarm
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

        //useServer.getState().setWSActionMessage(data)
      }

    } catch (e) {
      useServer.getState().wsActionConnection?.close()
      useServer.getState().setWsActionConnection(null)
    } 
  }
}



function wsRegisterListener(msg: any) {
  switch (msg.type) {
    case Query.ZXCVBN:
      if (msg.content) {
        let content = msg.content as Content
        if (content.hasOwnProperty('guesses') && content.hasOwnProperty('score') && content.hasOwnProperty('serverMinimum')) {
          let parsed_msg: wsRegisterMsg = {
            type: Query.ZXCVBN,
            content: content
          }
          useServer.getState().setWSRegisterMessage(parsed_msg)
        }
      }
      break
    case Query.Form:
      if (msg.content) {
        let content = msg.content as boolean
        if (content === true || content === false) {
          let parsed_msg: wsRegisterMsg = {
            type: Query.Form,
            content: content
          }
          useServer.getState().setWSRegisterMessage(parsed_msg)
        }

      }
      break
    default:
      break
  }
}
async function registerConnecting() {
  if (!urlEnds(Path.Register)) {
    useServer.getState().wsActionConnection?.close()
    return null
  }
  await sleep(200)
  if (!useServer.getState().wsRegisterConnection) {
    let ws = new WebSocket(useServer.getState().wsRegister)
    ws.onmessage = (event: MessageEvent) => {
      console.log(event.data)
      try {
        wsRegisterListener(JSON.parse(event.data))
      } catch (e) {
        //console.log(e)
      }
    }
    ws.onclose = (event: CloseEvent) => {
      useServer.getState().setWsRegisterConnection(null)
    }
    return ws
  }
  return useServer.getState().wsRegisterConnection
}

async function onOpenRoutine(ws: WebSocket) {
  if (!checkIfConnected){
    return
  }
  await sleep(2000)
  //check if ws is still open
  if (ws.readyState !== 1) {
    return
  }
  ws.send(".")
  //useAlarms.getState().fetchAlarms()
 // useLogIn.getState().getUserInfo()
  //useDevices.getState().fetchDevices()
  useLogIn.getState().updateState()
}
function actionConnecting() {
  //await sleep(20)
  if (useLogIn.getState().token.length < 3) {
    //await sleep(200)
    return null
  }
  //return null

  //console.log("websocket connecting")
  let wsToken =  useLogIn.getState().getWsToken()
  if (!wsToken || wsToken.length < 3) {
    //await sleep(200)
    return null
  }
  let socketAddress = `${useServer.getState().wsAction}/${wsToken}`
  let ws = new WebSocket(socketAddress)
  ws.onopen = (event: Event) => {
    //ws.send(JSON.stringify({mode: 'client', token: useLogIn.getState().token}))
    onOpenRoutine(ws)
  }
  ws.onmessage = (event: MessageEvent) => {
   // console.log(event.data)
    try {
     // console.log(event.data)
      wsActionListener(JSON.parse(event.data))
    } catch (e) {

      //console.log(e)  
    }
    try {
      //send pong
      ws.send(".")
    } catch (e) { }
  }
  ws.onerror = (event: Event) => {
    // try {
    //   useServer.getState().wsActionConnection?.close()
    //   useServer.getState().setWsActionConnection(null)
    // } catch (e) {
    //   //console.log(e)
    // }
  }
  ws.onclose = (event: CloseEvent) => {
    ws.removeEventListener("message", wsActionListener)
    // sleep(5000).then(() => {
    //   useServer.getState().wsActionReconnect() 
    // })
    //check if session is still valid
    //reconnectRoutine()
    //useServer.getState().setWsActionConnection(null)
  }
  return ws
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
        setWsRegisterConnection: (ws) => set({ wsRegisterConnection: ws }),
        setWSRegisterMessage: (message) => set({ wsRegisterMessage: message }),
        wsRegisterSendMessage: (message) => {
          get().wsRegisterConnection?.send(message)
        },
        setWsActionConnection: (ws) => set(
                                            { 
                                              wsActionConnection: ws 
                                            }
        ),
        setWSActionMessage: (message) => set({ wsActionMessage: message }),
        wsActionConnect:  () => {
          //useLogIn.getState().validateSession()
          //await sleep(200)
          // let status = useLogIn.getState().sessionValid
          // if (status !== SessionStatus.Valid) {
          //   return
          // }
         console.log( "Reconnecting, bitches")
          let wsAction = get().wsActionConnection
          let continueConnecting = true
          if (wsAction) {
            //continueConnecting =   checkIfConnected()
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
          //console.log(`${get().extended}/${part}`)
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
    await sleep(15000)
    let conn = useServer.getState().wsActionConnection
    if (conn){
      if ((conn.readyState !== 1) && (conn.readyState !== 0)){
        useServer.getState().wsActionConnect()
      }
    } else {
      useServer.getState().wsActionConnect()
    }
  }
}
actionChecker()

export default useServer
