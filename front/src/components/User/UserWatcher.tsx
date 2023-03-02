import React, { useState, useEffect, useRef } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import sleep  from '../sleep'
import { useServer, useLogIn, useDevices, useAlarms } from '../../stores'

var wsTimeout : NodeJS.Timeout | null = null

const UserWatcher = () => {
  //Public API that will echo messages sent to it back to the client
  const fetchAlarms = useAlarms((state)=> state.fetchAlarms)
  const fetchDevices = useDevices((state)=> state.fetchDevices)
  const token = useLogIn((state) => state.token)

  const wsServer = useServer((state) => state.wsAddress)
  const wsURL = wsServer +'/action'
  const [ socketUrl ] = useState(wsURL)
  const didUnmount = useRef<HTMLButtonElement| boolean| null>(null)
  const userInfoFetch = useLogIn((state) => state.getUserInfo)
  const { sendMessage, lastMessage } = useWebSocket(socketUrl, {
    onOpen: () => sendIdentity(),
    shouldReconnect: (closeEvent) => {
      /*
      useWebSocket will handle unmounting for you, but this is an example of a 
      case in which you would not want it to automatically reconnect
    */
      //return didUnmount.current === true
      return true
    },
    reconnectAttempts: 1e8,
    reconnectInterval: 500,
  })

 

  const sendIdentity = async () => {
    if(wsTimeout){
      clearTimeout(wsTimeout)
    }
    if(token && token.length > 3){
      console.log('sending credits')
      sendMessage(JSON.stringify({mode:'client', token: token}))
    }else{
      wsTimeout = setTimeout(sendIdentity, 5000)
    }
  } 

  useEffect(() => {
    const watcher = async () => { 
      if (lastMessage !== null) {
        let msgData = JSON.parse(lastMessage.data)
        if(!msgData || !msgData.hasOwnProperty('url')){
          return
        }
      let urlSplit : Array<string> = msgData.url.split('/')

      if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'alarm'){
        await sleep(500)
        fetchAlarms()
      }
      if((urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && ["device", "devices"].includes(urlSplit[urlSplit.length - 2]))||(urlSplit.length > 2 && urlSplit[2] === "device")){
        await sleep(500)
        fetchDevices()
      }
      if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'editUser'){
        await sleep(5000)
        userInfoFetch()
      }
    }
  }
  watcher()
  }, [lastMessage, token ])

  useEffect(() => {
    sendIdentity()
  },[token])


  //const handleClickSendMessage = useCallback(() => sendMessage('Hello'), [])

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: 'Connecting',
  //   [ReadyState.OPEN]: 'Open',
  //   [ReadyState.CLOSING]: 'Closing',
  //   [ReadyState.CLOSED]: 'Closed',
  //   [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  // }
  // //console.log(ReadyState)
  // [readyState]

  useEffect(() => {
    return () => {
      didUnmount.current = true
    }
  }, [])
  return (<></>)

}

export default UserWatcher
