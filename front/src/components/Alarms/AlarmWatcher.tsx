import React, { useEffect } from "react"
import { timeToNextAlarm } from "./calcAlarmTime"
import { useNavigate } from "react-router-dom"
import { useDevices, useTimeouts, useAlarms, useAudio, extend } from "../../stores"
import { urlEnds } from "../../utils"
import { Path } from "../../type"

const AlarmWatcher  = () => {
    const setTimeoutId = useTimeouts((state)=> state.setId)
    const clearAlarmTimeout = useTimeouts((state)=> state.clearIdTimeout)
    const alarms = useAlarms((state)=> state.alarms)
    const runAlarm = useAlarms((state)=> state.runAlarm)
    const setRunAlarm = useAlarms((state)=> state.setRunAlarm)
    const runOtherSnooze = useAlarms((state)=> state.runOtherSnooze)
    const setRunOtherSnooze  = useAlarms((state)=> state.setRunOtherSnooze)
    const currentDevice  = useDevices((state)=> state.currentDevice)
    const setTimeForNextLaunch = useAlarms((state)=> state.setTimeForNextLaunch)
    const reloadAlarmList = useAlarms((state)=>state.reloadAlarmList) 
    const setReloadAlarmList = useAlarms((state)=>state.setReloadAlarmList) 
    const setTrack = useAudio((state)=> state.setTrack)
    const navigate = useNavigate()

    useEffect(() => {
        const filterAlarms = () => {
            setTimeForNextLaunch(-1)
            if(runAlarm){
                if((runAlarm.active === false) || alarms.filter(a => a.id == runAlarm.id).length === 0 || (currentDevice && (!runAlarm.devices.includes(currentDevice)))){
                    setRunAlarm(undefined)
                }
            }
            if(!runOtherSnooze && urlEnds(Path.PlayAlarm) && runAlarm ) { 
                let currentRunArr = alarms.filter(alarm => alarm.id === runAlarm.id)
                if (currentRunArr.length === 1){
                    let timeNow = new Date().getTime()
                    let diff = timeNow - Math.max(...currentRunArr[0].snooze) 
                    if(diff < 60000 || currentRunArr[0].snooze[0] === 0){
                        setRunOtherSnooze(true)
                    }
                }
            }
            if(alarms && currentDevice && alarms.length > 0){
                let filteredAlarms = useAlarms.getState().alarms.filter(alarm => alarm.devices.includes(currentDevice) && alarm.active)
                let idTimeOutMap = new Map<number,string>()
                for(const alarm of filteredAlarms){
                    let timed = timeToNextAlarm(alarm)
                    if(timed && (!isNaN(timed)) && (Math.abs(timed) !== Infinity) ){
                        idTimeOutMap.set(timed, alarm.id)
                    }
                }
                let minTime = Math.min(...idTimeOutMap.keys())
                if(minTime && (!isNaN(minTime)) && (Math.abs(minTime) !== Infinity) ){
                    clearAlarmTimeout()
                    let runThis =  idTimeOutMap.get(minTime)
                    let timed = timeToNextAlarm(alarms.filter(alarm => alarm.id === runThis)[0])
                    if( runThis && (timed > 100)){
                        setRunAlarm(runThis)
                        let timeOutID = setTimeout(() => { navigate(extend(Path.PlayAlarm)) }, timed)
                        setTimeoutId(timeOutID)
                        //let alarmDate =   new Date(timed + Date.now())
                        //console.log('launching in: ', `${Math.ceil(timed/1000)} seconds`, alarmDate)
                        setTimeForNextLaunch(Math.ceil(timed/1000))
                        setTrack(alarms.filter(alarm => alarm.id === runThis)[0].tone)
                     }  
                }
            }
        }
        filterAlarms()
    },[alarms, currentDevice, reloadAlarmList])
    return (<></>)
}

export default AlarmWatcher