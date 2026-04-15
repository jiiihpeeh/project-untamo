import { useAudio, useDevices, useAlarms, usePopups, useLogIn, useSettings } from '../../stores'
import { useShallow } from 'zustand/react/shallow'
import { timePadding, time24hToTime12h } from '../../utils'
import { timeToUnits, timeForNextAlarm, timeToNextAlarm } from './calcAlarmTime'
import React, { useState, useEffect } from 'preact/compat'
import { ColorMode } from '../../type'

function AlarmPop() {
    const windowSize = usePopups((state) => state.windowSize)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navHeight = useSettings((state) => state.height)
    const clock24 = useSettings((state) => state.clock24)
    const colorMode = useSettings((state) => state.colorMode)
    const userInfo = useLogIn((state) => state.user)
    const plays = useAudio((state) => state.plays)
    const stop = useAudio((state) => state.stop)
    const [alarms, runAlarm, setToEdit, timeForNextLaunch, resetSnooze] = useAlarms(useShallow(state => [state.alarms, state.runAlarm, state.setAlarmToEdit, state.timeForNextLaunch, state.resetSnooze] as const))
    const currentDevice = useDevices(state => state.currentDevice)
    const devices = useDevices(state => state.devices)
    const [showAlarmPop, setShowAlarmPop, setShowEdit, navigationTriggered] = usePopups(useShallow((state) => [state.showAlarmPop, state.setShowAlarmPop, state.setShowEditAlarm, state.navigationTriggered] as const))
    const [noSnooze, setNoSnooze] = useState(true)
    const setShowAddAlarm = usePopups((state) => state.setShowAddAlarm)
    const [posStyle, setPosStyle] = useState<React.CSSProperties>({})

    function footerText() {
        const addBtn = (
            <button className="btn btn-sm w-full mt-2" onClick={() => setShowAddAlarm(true)}>
                Add an Alarm
            </button>
        )
        if (!runAlarm || !currentDevice || !(runAlarm.devices).includes(currentDevice) || timeForNextLaunch < 0) {
            return (
                <div>
                    <div className="text-sm text-center">No alarms for this device</div>
                    {addBtn}
                </div>
            )
        }
        const units = timeToUnits(timeForNextLaunch)
        let timeLeftText = ""
        if (units.days === 0) {
            if (units.hours === 0) timeLeftText = `${timePadding(units.minutes)}:${timePadding(units.seconds)}`
            else timeLeftText = `${timePadding(units.hours)}:${timePadding(units.minutes)}`
        } else {
            timeLeftText = `${units.days} days ${timePadding(units.hours)}:${timePadding(units.minutes)}`
        }
        return (
            <div>
                <div className="text-sm text-center">Time left to next alarm: {timeLeftText}</div>
                {addBtn}
            </div>
        )
    }

    function timerInfo() {
        let postFix = ""
        let timeInfo = runAlarm?.time ? timePadding(runAlarm.time[0]) + ":" + timePadding(runAlarm.time[1]) : ""
        if (!clock24 && timeInfo) {
            const convertedTime = time24hToTime12h(runAlarm?.time ? runAlarm.time : [0, 0])
            timeInfo = timePadding(convertedTime.time[0]) + ":" + timePadding(convertedTime.time[1])
            postFix = convertedTime['12h']
        }
        return (
            <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-center">
                    Coming Up: {runAlarm ? timeInfo : ""} {postFix}
                </div>
                <div className="flex gap-2 justify-center">
                    {runAlarm && (
                        <button className="btn btn-xs btn-primary" onClick={() => {
                            if (runAlarm) { setToEdit(runAlarm.id); setShowEdit(true) }
                        }}>Edit the Alarm</button>
                    )}
                    {!noSnooze && (
                        <button className="btn btn-xs" onClick={resetSnooze}>Reset Snooze</button>
                    )}
                </div>
            </div>
        )
    }
    function turnOff() {
        if (!plays) return null
        return (
            <div className="flex justify-center mt-2">
                <button className="btn btn-sm" onClick={stop}>Turn off Sound</button>
            </div>
        )
    }

    useEffect(() => {
        if (runAlarm) {
            let epochAlarm = timeToNextAlarm(runAlarm)
            let timeToAlarm = timeForNextAlarm(runAlarm).getTime() - Date.now()
            setNoSnooze(Math.abs(epochAlarm - timeToAlarm) < 20)
        }
    }, [runAlarm, alarms])
    useEffect(() => {
        let elem = document.getElementById("link-alarm")
        let navBar = document.getElementById("NavBar")
        if (elem && navBar) {
            let coords = elem.getBoundingClientRect()
            setPosStyle({ left: coords.left - 100, top: (navBarTop) ? navHeight : windowSize.height - navHeight, position: "fixed" })
        }
    }, [navigationTriggered])

    function getCurrentDevice() {
        if (currentDevice) {
            let device = devices.filter(d => d.id === currentDevice)[0]
            return (device) ? device.deviceName : ""
        }
        return ""
    }
    if (!showAlarmPop) return null
    return (
        <div
            className="fixed z-50 bg-base-100 rounded-box shadow-lg border border-base-300 min-w-52 max-w-xs"
            style={posStyle}
            onMouseDown={e => e.preventDefault()}
        >
            <div className="p-3 border-b border-base-200 text-center font-semibold text-sm">
                Alarms for {userInfo.screenName} on {getCurrentDevice()}
            </div>
            {runAlarm && (
                <div className="p-3">
                    {timerInfo()}
                    {turnOff()}
                </div>
            )}
            <div className="p-3 border-t border-base-200">
                {footerText()}
            </div>
        </div>
    )
}

export default AlarmPop