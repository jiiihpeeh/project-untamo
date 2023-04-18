import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Path } from '../type'
import { urlEnds, sleep  } from '../utils'
import useLogIn from './loginStore'
import useAlarms from './alarmStore'
import useDevices from './deviceStore'

type wsActionMsg = {
  url?: string,
  mode?: string,
}
export interface Content{
  guesses: number,
  score: number,
  server_minimum: number
}
export enum Query{
  ZXCVBN = "zxcvbn",
  Form = "form" 
}
type wsRegisterMsg = {
  content: Content|boolean,
  type: Query
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
    wsActionDisconnect: () => void,
    setWsActionConnection: (ws: WebSocket|null) => void,
    setWSActionMessage: (message: wsActionMsg|null) => void,
    wsActionReconnect: () => void,  
    wsActionConnect: () => void,
    setWsRegisterConnection: (ws: WebSocket|null) => void,
    setWSRegisterMessage: (message: wsRegisterMsg|null) => void,
    wsRegisterConnect: () => void,
    wsRegisterDisconnect: () => void,
    wsRegisterSendMessage: (message: string) => void,
    extend: (part: Path) => string,
    setAddress : (input:string) => void
}

const metaAddress = document.head.querySelector("[property~=server][address]")?.attributes.getNamedItem("address")?.value
const baseAddress = (metaAddress)?metaAddress:"http://localhost:3001"
const metaExtend = document.head.querySelector("[property~=url][extend]")?.attributes.getNamedItem("extend")?.value
const baseExtend = (metaExtend)?metaExtend:""

const websocketAddress = (server: string) =>{
  let base = server.split("://")
  if(base[0] ==="https"){
    return "wss://"+base[1]
  }
  return  "ws://"+base[1]
}
function wsActionListener(data:any){
  //console.log(data)
  if(typeof data === 'object'){
      try{
        if(data.hasOwnProperty('url') && typeof data.url === 'string' && data.url !== ''){
          useServer.getState().setWSActionMessage(data)
        }

      }catch(e){
        useServer.getState().wsActionConnection?.close()
        useServer.getState().setWsActionConnection(null)
      }
    }
}



function wsRegisterListener(msg:any){
  switch(msg.type){
    case Query.ZXCVBN:
      if(msg.content){
        let content = msg.content as Content
        if(content.hasOwnProperty('guesses') && content.hasOwnProperty('score') && content.hasOwnProperty('server_minimum')){
          let parsed_msg : wsRegisterMsg ={
            type: Query.ZXCVBN,
            content: content
          } 
          useServer.getState().setWSRegisterMessage(parsed_msg)
        }
      }
      break
    case Query.Form:
            if(msg.content){
                let content = msg.content as boolean
                if(content === true || content === false){
                    let parsed_msg : wsRegisterMsg ={
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
  if(!urlEnds(Path.Register)){
    useServer.getState().wsActionConnection?.close()
    return null
  }
  await sleep(200)
  if(!useServer.getState().wsRegisterConnection){
    let ws  = new WebSocket(useServer.getState().wsRegister)
    ws.onmessage = (event : MessageEvent) => {
      try{
        wsRegisterListener(JSON.parse(event.data))
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

async function actionConnecting(){
  await sleep(20)
  if(useLogIn.getState().token.length < 3){
    await sleep(200)
    return null
  }
  //console.log("websocket connecting")
  let ws = new WebSocket(useServer.getState().wsAction)
  ws.onopen = (event : Event) => {
    ws.send(JSON.stringify({mode: 'client', token: useLogIn.getState().token}))
    useAlarms.getState().fetchAlarms()
    useLogIn.getState().getUserInfo()
    useDevices.getState().fetchDevices()
  }
  ws.onmessage = (event : MessageEvent) => {
    try{
      wsActionListener(JSON.parse(event.data))
    }catch(e){
      //console.log(e)  
    } 
  }
  ws.onerror = (event : Event) => {
    try{
      useServer.getState().wsActionConnection?.close()
      useServer.getState().setWsActionConnection(null)
    }catch(e){
      //console.log(e)
    }
  }
  ws.onclose = (event : CloseEvent) => {
    ws.removeEventListener("message", wsActionListener)
    useServer.getState().setWsActionConnection(null)
  }
  return ws
}
const useServer = create<UseServer>()(
    persist(
      (set, get) => (
          {
            address: baseAddress,
            wsAddress: websocketAddress(baseAddress),
            wsAction: websocketAddress(baseAddress) + '/action',
            wsRegister: websocketAddress(baseAddress) + '/register-check',
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
              get().wsActionConnection?.close()
              let ws = await actionConnecting()
              set(
                  {
                    wsActionConnection: ws
                  }
                )
            },
            wsActionDisconnect: () => {
              get().wsActionConnection?.close()
              set({wsActionConnection: null})
            },
            wsActionReconnect: async () => {
              get().wsActionConnection?.close()
              let ws = await actionConnecting()
              set(
                  {
                    wsActionConnection: ws
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
            extended: baseExtend,
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

export default useServer
