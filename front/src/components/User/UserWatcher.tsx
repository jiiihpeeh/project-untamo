import React, { useState, useEffect, useRef } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import sleep  from '../sleep'
import { useServer, useLogIn, useDevices, useAlarms, useAudio, useTimeouts, extend } from '../../stores'
import { Navigate, useNavigate } from 'react-router-dom'
import { notification } from '../notification'
import { Alarm } from '../../type'

var wsTimeout : NodeJS.Timeout | null | number

const UserWatcher = () => {
  //Public API that will echo messages sent to it back to the client
  const fetchAlarms = useAlarms((state)=> state.fetchAlarms)
  const runAlarm = useAlarms((state)=> state.runAlarm)
  const alarms = useAlarms((state)=> state.alarms)

  const fetchDevices = useDevices((state)=> state.fetchDevices)
  const token = useLogIn((state) => state.token)

  const wsServer = useServer((state) => state.wsAddress)
  const wsURL = wsServer +'/action'
  const [ socketUrl ] = useState(wsURL)
  const didUnmount = useRef<HTMLButtonElement| boolean| null>(null)
  const userInfoFetch = useLogIn((state) => state.getUserInfo)
  const [ runner, setRunner ] = useState(runAlarm)
  const stop = useAudio((state) => state.stop)

  const plays = useAudio((state) => state.plays)
  const clearAlarm = useTimeouts((state)=> state.clearIdTimeout)
  const setReloadAlarmList = useAlarms((state)=>state.setReloadAlarmList) 
  const fingerprint = useLogIn((state)=>state.fingerprint)
  const navigate = useNavigate()
  const { sendMessage, lastMessage } = useWebSocket(socketUrl, {
    onOpen: () => sendIdentity("reconnect"),
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

 

  const sendIdentity = async (mode:string) => {
    if(wsTimeout){
      try{
        clearTimeout(wsTimeout)
      }catch(e:any){}
      
    }
    if(token && token.length > 3){
      //console.log('sending credits')
      sendMessage(JSON.stringify(
                                  {
                                    mode:'client', 
                                    token: token
                                  }
                                )
                  )
      if(mode === "reconnect"){
        await sleep(500)
        fetchAlarms()
        fetchDevices()
        userInfoFetch()
      }

    }else{
      wsTimeout = setTimeout(()=>sendIdentity(mode), 5000)
    }
  } 
  useEffect(()=>{
    const stopParallel = async() => {
      if (runner){
        let afterChange = alarms.filter(alarm => alarm.id === runner.id)[0]
        const path = (window.location.pathname).replaceAll('/','').trim()
        if(afterChange){
          if(afterChange.fingerprint !== fingerprint){
            //console.log("change detected ")
            if(path.endsWith("play-alarm") ){
              await  sleep(600)
              navigate(extend("/alarms"))
              if(plays){
                stop()
              }
              notification("Alarm", "An alarm was interrupted by another device ")
            }
            clearAlarm() 
          }
        }
      }
      setReloadAlarmList()
  }
    stopParallel()
  }, [alarms])
  useEffect(() => {
    const watcher = async () => { 
      if (lastMessage !== null) {
        let msgData = JSON.parse(lastMessage.data)
        if(!msgData || !msgData.hasOwnProperty('url')){
          return
        }
      let urlSplit : Array<string> = msgData.url.split('/')

      if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'alarm'){
        let runner : Alarm | undefined
        if (runAlarm){
          runner = alarms.filter(alarm => alarm.id === runAlarm.id)[0]
        }
        setRunner(runner)
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
    sendIdentity("token")
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
