import React, { useState, useEffect, useRef } from 'react'
import { useServer, useLogIn, useDevices, useAlarms, useAudio, useTimeouts, extend } from '../../stores'
import { useNavigate } from 'react-router-dom'
import { notification } from '../notification'
import { Alarm, Path } from '../../type'
import { urlEnds, sleep } from '../../utils'

const UserWatcher = () => {
  //Public API that will echo messages sent to it back to the client
  const fetchAlarms = useAlarms((state)=> state.fetchAlarms)
  const runAlarm = useAlarms((state)=> state.runAlarm)
  const alarms = useAlarms((state)=> state.alarms)

  const fetchDevices = useDevices((state)=> state.fetchDevices)
  const wsToken = useLogIn((state) => state.wsToken)

  const userInfoFetch = useLogIn((state) => state.getUserInfo)
  const [ runner, setRunner ] = useState(runAlarm)
  const stop = useAudio((state) => state.stop)

  const plays = useAudio((state) => state.plays)
  const clearAlarm = useTimeouts((state)=> state.clearIdTimeout)
  const setReloadAlarmList = useAlarms((state)=>state.setReloadAlarmList) 
  const fingerprint = useLogIn((state)=>state.fingerprint)
  const wsMessage = useServer((state)=>state.wsActionMessage)
  const wsConnect = useServer((state)=>state.wsActionConnect)
  const wsDisconnect = useServer((state)=>state.wsActionDisconnect)
  const wsConnection = useServer((state)=>state.wsActionConnection)
  const wsReconnect = useServer((state)=>state.wsActionReconnect)
  const navigate = useNavigate()

  useEffect(()=>{
    const stopParallel = async() => {
      if (runner){
        let afterChange = alarms.filter(alarm => alarm.id === runner.id)[0]
        if(afterChange){
          if(afterChange.fingerprint !== fingerprint){
            //console.log("change detected ")
            if(urlEnds(Path.PlayAlarm)){
              await  sleep(600)
              navigate(extend(Path.Alarms))
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
      //console.log(wsMessage)
      if(!wsMessage){
          return
      }
      if(!wsMessage.url){
        return
      }

      //let urlSplit : Array<string> = wsMessage.url.split('/')
      let urlApi = wsMessage.url
      //if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'alarm'){
      if (urlApi  === "/api/alarm"  ){ 
        let runner : Alarm | undefined
        if (runAlarm){
          runner = alarms.filter(alarm => alarm.id === runAlarm.id)[0]
        }
        setRunner(runner)
        await sleep(500)
        fetchAlarms()
        
      }
      //if((urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && ["device", "devices"].includes(urlSplit[urlSplit.length - 2]))||(urlSplit.length > 2 && urlSplit[2] === "device")){
      if (urlApi  === "/api/device"){
        await sleep(500)
        fetchDevices()
      }
      if (urlApi  === "/api/user"){
      //if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'editUser'){
        await sleep(5000)
        userInfoFetch()
      }
    }
    watcher()
  }, [wsMessage ])

  useEffect(() => {
      wsReconnect()
  },[wsToken])

  useEffect(() => {
    async function connector (){
      if(!wsConnection){
        while(true){
          await sleep(300)
          console.log(useServer.getState().wsActionConnection, useServer.getState().wsActionConnection?.OPEN)
          if (!useServer.getState().wsActionConnection?.OPEN){
            wsConnect()
          }
          await sleep(200)
          console.log(useServer.getState().wsActionConnection)
          if (useServer.getState().wsActionConnection?.OPEN){
            break
          } 
        }
      }
    }
    connector()
  },[wsConnection])

  return (<></>)
}

export default UserWatcher
