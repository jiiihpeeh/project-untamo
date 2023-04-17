import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Path } from '../type'
import WebSocket from 'tauri-plugin-websocket-api'
import {sleep} from '../utils'
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
    lastPing : number,
    setLastPing: (time: number) => void,
    wsActionDisconnect: () => void,
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
    if(data.hasOwnProperty('data') &&  data.hasOwnProperty('type') && data.type === 'Text'){
      try{
        let msg = JSON.parse(data.data) as wsActionMsg
        if(msg.hasOwnProperty('url') && typeof msg.url === 'string' && msg.url !== ''){
          useServer.getState().setWSActionMessage(msg)
        }
        if( msg.hasOwnProperty("mode") && msg.mode === 'pong'){
          useServer.getState().setLastPing(Date.now())
         }
      }catch(e){
        useServer.getState().wsActionConnection?.disconnect()
        useServer.getState().setWsActionConnection(null)
      }
    }else if ( data.hasOwnProperty('type') && data.type === 'Close'){
      try{
        useServer.getState().wsActionConnection?.disconnect()
        useServer.getState().setWsActionConnection(null)
      }catch(e){
        useServer.getState().setWsActionConnection(null)
      }   
    }
      
  }else {
    try{
      useServer.getState().wsActionConnection?.disconnect()
      useServer.getState().setWsActionConnection(null)
    }catch(e){
      useServer.getState().setWsActionConnection(null)
    }
  }
}



function wsRegisterListener(data:any){
  if(typeof data !== 'object' || (data &&  data.hasOwnProperty('type') && data.type !== 'Text')){
    useServer.getState().wsRegisterDisconnect()
    useServer.getState().wsRegisterConnect()
    return
  }
  let msg : any = null
  try{
    msg = JSON.parse(data.data)
    if(!msg.hasOwnProperty('type') || !msg.hasOwnProperty('content')){
      return
    }
  }catch(e){
    return
  }
  //console.log(msg)

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
                    //console.log(parsed_msg)
                    useServer.getState().setWSRegisterMessage(parsed_msg)
                } 
              
              }
      break
    default:
      break
    }

}
async function registerConnecting() {
  await sleep(200)
  if(!useServer.getState().wsRegisterConnection){
    let ws  = await WebSocket.connect(useServer.getState().wsRegister)
    ws.addListener(wsRegisterListener)
    console.log("register ", ws)
    return ws
  }
  return useServer.getState().wsRegisterConnection
}
async function actionConnecting(){
  console.log("websocket connecting")
  await sleep(100)
  let ws  = await WebSocket.connect(useServer.getState().wsAction)
  ws.addListener(wsActionListener)
  ws.send(JSON.stringify({mode: 'client', token: useLogIn.getState().token}))
  ws.send(JSON.stringify({mode: 'ping'}))
  useAlarms.getState().fetchAlarms()
  useLogIn.getState().getUserInfo()
  useDevices.getState().fetchDevices()
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
            lastPing: 0,
            setLastPing: (time) => set({lastPing: time}),
            wsRegisterConnect: async () => {
              let ws = await registerConnecting()
              set(
                  {
                    wsRegisterConnection: ws
                  }
                )
            },
            wsRegisterDisconnect: () => {
              get().wsRegisterConnection?.disconnect()
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
              let ws = await actionConnecting()
              set(
                  {
                    wsActionConnection: ws
                  }
                )
            },
            wsActionDisconnect: () => {
              get().wsActionConnection?.disconnect()
              set({wsActionConnection: null})
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
