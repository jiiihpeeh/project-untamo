import { timeForNextAlarm, timeToNextAlarm } from "./calcAlarmTime"
import React,{ useEffect, useState } from "react"
import { useToast, Button, VisuallyHidden } from "@chakra-ui/react"
import { useLogIn, useAlarms, useDevices, usePopups } from '../../stores'
import { SessionStatus, Alarm } from "../../type"

function AlarmNotification() {
    const [alarm, setAlarm] = useState<Alarm>()
    const alarms = useAlarms((state) => state.alarms)
    const runAlarm = useAlarms((state) => state.runAlarm)
    const currentDevice = useDevices((state) => state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const showToast = usePopups((state) => state.showToast)
    const toast = useToast()

    function addToast() {
        if (toast && !toast.isActive('alarm-notification') && alarm && currentDevice) {
            let duration = timeToNextAlarm(alarm)
            let description = timeForNextAlarm(alarm)
            return (toast(
                {
                    title: `${alarm.label}`,
                    description: `${description}`,
                    status: 'info',
                    duration: duration,
                    id: 'alarm-notification',
                    isClosable: true,
                }
            )
            )
        }
        return (<VisuallyHidden>
            <Button>
                Hi
            </Button>
        </VisuallyHidden>)
    }
    useEffect(() => {
        async function updateToast() {
            if (alarm) {
                let duration = timeToNextAlarm(alarm)
                let description = timeForNextAlarm(alarm)
                toast.update('alarm-notification',
                    {
                        title: `${alarm.label}`,
                        description: `${description}`,
                        duration: duration,
                        isClosable: true,
                        status: 'info',
                    }
                )
            }
        }
        updateToast()
    }, [alarm, toast])

    useEffect(() => {
        async function alarmSet() {
            if (runAlarm) {
                let alarmItem = alarms.filter(alarm => alarm.id === runAlarm.id)[0]
                if (alarmItem) {
                    setAlarm(alarmItem)
                } else {
                    setAlarm(undefined)
                }
            } else {
                setAlarm(undefined)
            }
        }
        if (showToast) {
            alarmSet()
        }

    }, [runAlarm, alarms, currentDevice, showToast])
    useEffect(() => {
        function closeToast() {
            toast.close('alarm-notification')
        }
        if ((sessionStatus !== SessionStatus.Valid) || !alarm || !currentDevice || !showToast) {
            closeToast()
        }
    }, [sessionStatus, alarm, toast, currentDevice, showToast])

    return (<VisuallyHidden>
        {addToast()}
    </VisuallyHidden>
    )
}
  export default AlarmNotification