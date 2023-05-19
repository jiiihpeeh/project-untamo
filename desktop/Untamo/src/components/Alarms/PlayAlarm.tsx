import React, { useState, useEffect } from 'react'
import { Text, Image, IconButton, Switch,
         Stack, Spacer, Heading, FormLabel } from "@chakra-ui/react"
import {  useAlarms, useTimeouts, useAudio, extend, usePopups, useTask, useSettings, useLogIn } from '../../stores'
import { CloseTask, Path } from '../../type'
import { urlEnds, sleep } from '../../utils'
import '../../App.css'
import { LaunchMode } from '../../stores/taskStore'

function PlayAlarm() {
    const windowSize = usePopups((state) => state.windowSize)
    const [clockSize, setClockSize] = useState(Math.min(windowSize.width, windowSize.height) * 0.35)
    const runAlarm = useAlarms((state) => state.runAlarm)
    const alarmClock = useAlarms((state) => state.logo)
    const resetSnooze = useAlarms((state) => state.resetSnooze)
    const snoozeAlarm = useAlarms((state) => state.snoozer)
    const clearTimeouts = useTimeouts((state) => state.clearIdTimeout)
    const playAudio = useAudio((state) => state.play)
    const setTrack = useAudio((state) => state.setTrack)
    const stopAudio = useAudio((state) => state.stop)
    const setLoop = useAudio((state) => state.setLoop)
    const clearRunTimeout = useTimeouts((state) => state.clearRunAlarmID)
    const snoozeIt = useTimeouts((state) => state.snoozeIt)
    const setSnoozeIt = useTimeouts((state) => state.setSnoozeIt)
    const launchMode = useTask((state) => state.launchMode)
    const setLaunchMode = useTask((state) => state.setLaunchMode)
    const setShowTask = usePopups((state) => state.setShowTask)
    const snoozePressTime = useSettings((state) => state.snoozePress)
    const closeTask = useSettings((state) => state.closeTask)
    const turnOffValue = useAlarms((state) => state.turnOff)
    const setTurnOffValue = useAlarms((state) => state.setTurnOff)
    const clearAlarmOutId = useTimeouts((state) => state.clearAlarmOutId)
    const setAlarmOut = useTimeouts((state) => state.setAlarmOut)
    const [pressTime, setPressTime] = useState(0)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)


    useEffect(() => {
        setClockSize(Math.min(windowSize.width, windowSize.height) * 0.35)
    }, [windowSize])


    function removeAlarmObject() {
        try {
            //clearRunTimeout()
            clearTimeouts()
        } catch (err) { }
    }
    async function closeSequence(ms: number, clear: boolean = false) {
        await sleep(ms)
        setNavigateTo(Path.Alarms)
        stopAudio()
        if (clear) {
            clearAlarmOutId()
        }
    }
    function turnOff() {
        if ((closeTask === CloseTask.Obey && runAlarm && runAlarm.closeTask) || (closeTask === CloseTask.Force)) {
            setShowTask(true)
        } else {
            //console.log("turn OFF")
            resetSnooze()
            removeAlarmObject()
            closeSequence(100)
        }
    }
    useEffect(() => {
        if (launchMode === LaunchMode.Snooze) {
            setLaunchMode(LaunchMode.None)
            setSnoozeIt(true)
        } else if (launchMode === LaunchMode.TurnOff) {
            setLaunchMode(LaunchMode.None)
            resetSnooze()
            removeAlarmObject()
            closeSequence(100, true)
        }
        //console.log(launchMode)
    }, [launchMode])

    useEffect(() => {
        async function playIt() {
            setLaunchMode(LaunchMode.None)
            if (runAlarm) {
                //setSnoozeIt(false)
                setTrack(runAlarm.tune)
                setLoop(true)
                let step = 0
                while (!urlEnds(Path.PlayAlarm) || step > 300) {
                    await sleep(10)
                    step++
                }
                useAudio.getState().setPlayingAlarm(runAlarm.id)
                playAudio()
            } else {
                clearRunTimeout()
            }
        }
        playIt()
    }, [runAlarm])

    useEffect(() => {
        if (snoozeIt) {
            snoozeAlarm()
            removeAlarmObject()
            closeSequence(100, true)
            setSnoozeIt(false)
        }
    }, [snoozeIt])

    function snoozePressFunction(time: number) {
        if ((pressTime > 0) && (time - pressTime > snoozePressTime)) {
            setSnoozeIt(true)
            setPressTime(0)
        }
    }
    function userPressStart(e: any) {
        e.preventDefault()
        setPressTime(Date.now())
    }
    function userPressStop(e: any) {
        e.preventDefault()
        snoozePressFunction(Date.now())
    }

    useEffect(() => {
        if (turnOffValue) {
            turnOff()
            setTurnOffValue(false)
        }
    }, [turnOffValue])

    return (
        <Stack align='center'>
            <Heading
                as="h1"
                size='4xl'
                color='tomato'
                textShadow='2px 4px #ff0000'
                className='AlarmMessage'
                mt={"25%"}
            >
                {runAlarm ? runAlarm.label : ''}    <Text
                    fontSize='sm'
                    textShadow='1px 1px #ff0000'
                >
                    ({runAlarm ? runAlarm.time : ''})
                </Text>
            </Heading>
            <Heading
                as='h3'
                size='md'
            >
                Snooze the Alarm by clicking the clock below
            </Heading>
            <IconButton
                width={clockSize}
                height={clockSize}
                borderRadius="50%"
                className="AlarmClock"
                bgGradient="radial-gradient(circle, rgba(145,201,179,1) 0%, rgba(9,9,121,1) 0%, rgba(108,27,160,0.7945378835127801) 0%, rgba(136,32,171,1) 30%, rgba(16,23,135,1) 73%, rgba(50,96,210,1) 99%, rgba(148,182,155,1) 100%, rgba(51,175,32,0.5312325613839286) 100%)"
                //onClick={(e)=>setSnoozeIt(true)}
                aria-label=""
                value=""
                id="Snooze-Button"
                onMouseDown={userPressStart}
                onMouseUp={userPressStop}
                onTouchStart={userPressStart}
                onTouchEnd={userPressStop}
            >
                <Image
                    src={alarmClock}
                    width='60%'
                    draggable="false"
                    pointerEvents={"none"} />
            </IconButton>
            <Spacer />
            <FormLabel
                mb='0'
            >
                <Text
                    as='b'
                >
                    Turn alarm OFF
                </Text>
            </FormLabel>
            <Switch
                size='lg'
                isChecked={turnOffValue}
                onChange={() => setTurnOffValue(!turnOffValue)} />
        </Stack>
    )
}
export default PlayAlarm