import React, { useEffect } from 'preact/compat'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { useDevices, useAlarms, useAudio, useLogIn, useSettings } from "../../stores"
import { useStore } from "../../stores/store"
import { Path } from "../../type"

type AlarmFirePayload = { id: string; tune: string }

function AlarmWatcher() {
    const alarms          = useAlarms((state) => state.alarms)
    const setRunAlarm     = useAlarms((state) => state.setRunAlarm)
    const reloadAlarmList = useAlarms((state) => state.reloadAlarmList)
    const currentDevice   = useDevices((state) => state.currentDevice)
    const setTrack        = useAudio((state) => state.setTrack)
    const setNavigateTo   = useLogIn((state) => state.setNavigateTo)
    const volume          = useSettings((state) => state.volume)

    // Push the current alarm list, device, and volume to the Rust daemon whenever
    // they change. The daemon returns milliseconds until the next alarm — set
    // directly to avoid triggering the JS timeForNext() side-effect.
    useEffect(() => {
        if (!currentDevice) return
        invoke<number | null>('update_alarm_daemon', {
            alarms,
            deviceId: currentDevice,
            volume: volume ?? 1.0,
        })
            .then(ms => {
                const secs = ms != null && ms > 0 ? Math.ceil(ms / 1000) : -1
                useStore.setState({ timeForNextLaunch: secs })
            })
            .catch(console.error)
    }, [alarms, currentDevice, reloadAlarmList, volume])

    // Listen for the alarm-fire event emitted by the Rust daemon
    useEffect(() => {
        const unlisten = listen<AlarmFirePayload>('alarm-fire', ({ payload }) => {
            setRunAlarm(payload.id)
            setTrack(payload.tune)
            setNavigateTo(Path.PlayAlarm)
        })
        return () => { unlisten.then(fn => fn()) }
    }, [])

    return (<></>)
}

export default AlarmWatcher
