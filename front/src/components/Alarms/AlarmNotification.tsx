import { timeForNextAlarm, timeToNextAlarm } from "./calcAlarmTime"
import { useEffect, useState } from "preact/hooks"
import { toast } from "../../ui/Toast"
import { useLogIn, useAlarms, useDevices, usePopups } from '../../stores'
import { SessionStatus, Alarm } from "../../type"

function AlarmNotification() {
    const [alarm, setAlarm] = useState<Alarm | undefined>(undefined)
    const alarms = useAlarms((state) => state.alarms)
    const runAlarm = useAlarms((state) => state.runAlarm)
    const currentDevice = useDevices((state) => state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const showToast = usePopups((state) => state.showToast)

    useEffect(() => {
        async function alarmSet() {
            if (runAlarm) {
                const alarmItem = alarms.find(a => a.id === runAlarm.id)
                setAlarm(alarmItem)
            } else {
                setAlarm(undefined)
            }
        }
        if (showToast) alarmSet()
    }, [runAlarm, alarms, currentDevice, showToast])

    useEffect(() => {
        if (alarm && currentDevice && showToast && sessionStatus === SessionStatus.Valid) {
            const description = String(timeForNextAlarm(alarm))
            toast({ type: 'info', title: alarm.label, description })
        }
    }, [alarm])

    return null
}

export default AlarmNotification
