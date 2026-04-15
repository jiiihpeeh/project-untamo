import React, { useState, useEffect } from 'preact/compat'
import { useAlarms, useTimeouts, useAudio, usePopups, useTask, useSettings, useLogIn } from '../../stores'
import { CloseTask, Path } from '../../type'

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
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)
    const [pressTime, setPressTime] = useState(0)

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
        setLaunchMode(LaunchMode.None)
        if (runAlarm) {
            // Audio is started by the Rust alarm daemon before alarm-fire is emitted.
            // We just update the store state so stop() / snooze logic behaves correctly.
            setTrack(runAlarm.tune)
            setLoop(true)
            useAudio.getState().setPlayingAlarm(runAlarm.id)
        } else {
            clearRunTimeout()
        }
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
        <div className="flex flex-col items-center gap-4 pt-20">
            <h1 className="text-5xl font-bold text-red-500 AlarmMessage" style={{ textShadow: '2px 4px #ff0000' }}>
                {runAlarm ? runAlarm.label : ''}
                <span className="text-sm ml-2" style={{ textShadow: '1px 1px #ff0000' }}>
                    ({runAlarm ? `${runAlarm.time[0]}:${runAlarm.time[1]}` : ''})
                </span>
            </h1>
            <h3 className="text-lg font-medium">Snooze the Alarm by clicking the clock below</h3>
            <button
                id="Snooze-Button"
                className="AlarmClock btn btn-circle p-2"
                style={{
                    width: clockSize,
                    height: clockSize,
                    minHeight: clockSize,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(145,201,179,1) 0%, rgba(9,9,121,1) 0%, rgba(108,27,160,0.79) 0%, rgba(136,32,171,1) 30%, rgba(16,23,135,1) 73%, rgba(50,96,210,1) 99%)',
                }}
                onMouseDown={userPressStart}
                onMouseUp={userPressStop}
                onTouchStart={userPressStart}
                onTouchEnd={userPressStop}
            >
                <img src={alarmClock} style={{ width: '60%', pointerEvents: 'none' }} draggable={false} />
            </button>
            <div className="flex flex-col items-center gap-2 mt-4">
                <label className="font-bold">Turn alarm OFF</label>
                <input type="checkbox" className="toggle toggle-lg"
                    checked={turnOffValue}
                    onChange={() => setTurnOffValue(!turnOffValue)} />
            </div>
        </div>
    )
}
export default PlayAlarm