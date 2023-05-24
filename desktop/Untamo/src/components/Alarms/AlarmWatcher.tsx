import React, { useEffect } from "react"
import { timeToNextAlarm } from "./calcAlarmTime"
import { useDevices, useTimeouts, useAlarms, useAudio, useLogIn } from "../../stores"
import { sleep, urlEnds } from "../../utils"
import { Alarm, Path } from "../../type"

function AlarmWatcher() {
    const setTimeoutId = useTimeouts((state) => state.setId)
    const clearAlarmTimeout = useTimeouts((state) => state.clearIdTimeout)
    const alarms = useAlarms((state) => state.alarms)
    const runAlarm = useAlarms((state) => state.runAlarm)
    const setRunAlarm = useAlarms((state) => state.setRunAlarm)
    const currentDevice = useDevices((state) => state.currentDevice)
    const setTimeForNextLaunch = useAlarms((state) => state.setTimeForNextLaunch)
    const reloadAlarmList = useAlarms((state) => state.reloadAlarmList)
    const setTrack = useAudio((state) => state.setTrack)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    useEffect(() => {
        async function filterAlarms() {
            setTimeForNextLaunch(-1)
            if (runAlarm) {
                //get alarm with same id as runAlarm
                let runners = alarms.filter(alarm => alarm.id === runAlarm.id)
                let runner : Alarm
                if (runners.length == 1) {
                    runner = runners[0]
                }else{
                    runner = runAlarm
                }
                if ((runner.active === false) || alarms.filter(a => a.id == runner.id).length === 0 || (currentDevice && (!runner.devices.includes(currentDevice)))) {
                    setRunAlarm(undefined)
                    clearAlarmTimeout()
                    await sleep(10)
                    //console.log('clearing runAlarm')
                }                  
            }
            if (alarms && currentDevice && alarms.length > 0) {
                let filteredAlarms = useAlarms.getState().alarms.filter(alarm => alarm.devices.includes(currentDevice) && alarm.active)
                let idTimeOutMap = new Map<number, string>()
                for (const alarm of filteredAlarms) {
                    let timed = timeToNextAlarm(alarm)
                    if (timed && (!isNaN(timed)) && (Math.abs(timed) !== Infinity)) {
                        idTimeOutMap.set(timed, alarm.id)
                    }
                }
                let minTime = Math.min(...idTimeOutMap.keys())
                if (minTime && (!isNaN(minTime)) && (Math.abs(minTime) !== Infinity)) {
                    clearAlarmTimeout()
                    let runThis = idTimeOutMap.get(minTime)
                    let timed = timeToNextAlarm(alarms.filter(alarm => alarm.id === runThis)[0])
                    if (runThis && (timed > 100)) {
                        setRunAlarm(runThis)
                        let timeOutID = setTimeout(() => { setNavigateTo(Path.PlayAlarm) }, timed)
                        setTimeoutId(timeOutID)
                        //let alarmDate =   new Date(timed + Date.now())
                        //console.log('launching in: ', `${Math.ceil(timed/1000)} seconds`, alarmDate)
                        setTimeForNextLaunch(Math.ceil(timed / 1000))
                        setTrack(alarms.filter(alarm => alarm.id === runThis)[0].tune)
                    }
                }
            }
        }
        filterAlarms()
    }, [alarms, currentDevice, reloadAlarmList])
    return (<></>)
}

export default AlarmWatcher