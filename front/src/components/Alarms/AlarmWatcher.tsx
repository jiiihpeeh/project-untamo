import React, { useEffect } from "react"
import { timeToNextAlarm } from "./calcAlarmTime"
import { useNavigate } from "react-router-dom"
import { useDevices, useTimeouts, useAlarms } from "../../stores"

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

    const navigate = useNavigate()

    useEffect(() => {
        const filterAlarms = () => {
            setTimeForNextLaunch(-1)
            if(runAlarm){
                if((runAlarm.active === false) || (currentDevice && (!runAlarm.devices.includes(currentDevice)))){
                    setRunAlarm('')
                }
            }
            if(!runOtherSnooze && (window.location.pathname === '/play-alarm/') && runAlarm ) { 
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
                let filteredAlarms = alarms.filter(alarm => alarm.devices.indexOf(currentDevice) !== -1 )
                filteredAlarms = filteredAlarms.filter(alarm => alarm.active === true)
                let idTimeOutMap = new Map<number,string>()
                for(const alarm of filteredAlarms){
                    let timed = timeToNextAlarm(alarm)
                    if(timed && (!isNaN(timed)) && (Math.abs(timed) !== Infinity) ){
                        idTimeOutMap.set(timed, alarm.id)
                    }
                }
                let minTime = Math.min(...idTimeOutMap.keys())
                if(minTime && (!isNaN(minTime)) && (Math.abs(minTime) !== Infinity) ){
                    let runThis =  idTimeOutMap.get(minTime)
                    let timed = timeToNextAlarm(alarms.filter(alarm => alarm.id === runThis)[0])
                    
                    if( runThis && (timed > 100)){
                        clearAlarmTimeout()
                        setRunAlarm(runThis)
                        let timeOutID = setTimeout(() => { navigate('/play-alarm/') }, timed)
                        setTimeoutId(timeOutID)
                        let alarmDate =   new Date(timed + Date.now())
                        //console.log('launching in: ', `${Math.ceil(timed/1000)} seconds`, alarmDate)
                        setTimeForNextLaunch(Math.ceil(timed/1000))
                     }  
                }
            }
        }
        filterAlarms()
    },[alarms, currentDevice])
    return (<></>)
}

export default AlarmWatcher