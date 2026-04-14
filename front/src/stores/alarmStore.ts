import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { WeekDay, Alarm, AlarmCases } from '../type'
import { notification, Status } from '../components/notification'
import { getCommunicationInfo, apiGet, apiPost, apiPut, apiDelete } from './api'
import { timeToNextAlarm } from '../components/Alarms/calcAlarmTime'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – Vite ?raw import; declared in vite-env.d.ts, tsc passes fine
import alarmClockString from './logo.svg?raw'
import { isEqual, sleep } from '../utils'
// circular import — safe: useStore only accessed inside function bodies after init
import { useStore } from './store'

const alarmClock = URL.createObjectURL(new Blob([alarmClockString], { type: 'image/svg+xml' }))
const maxAlarmTime = 60 * 60 * 1000

export function uniqueAlarms(alarms: Array<Alarm>) {
    return alarms.filter((alarm, index, self) =>
        index === self.findIndex(t => t.id === alarm.id)
    )
}

export async function postOfflineAlarms() {
    const { token } = getCommunicationInfo()
    if (!token) return
    const alarms = useStore.getState().alarms
    const offlineAlarms = alarms.filter(alarm => alarm.id.endsWith("OFFLINE"))
    for (const alarm of offlineAlarms) {
        const postAlarm: Partial<Alarm> = { ...alarm }
        delete postAlarm.id
        if (!alarm) return
        try {
            const result = await apiPost<{ id: string }>('/api/alarm', postAlarm)
            const alarmWithID = postAlarm as Alarm
            alarmWithID.id = result.id
            notification("Alarm", "Offline Alarm inserted to an online database")
            const filteredAlarms = useStore.getState().alarms.filter(a => a.id !== alarm.id)
            useStore.setState({ alarms: [...filteredAlarms, alarmWithID] })
        } catch {
            notification("Edit Alarm", " Offline Alarm save failed ", Status.Error)
        }
    }
    await sleep(200)
}

async function postOfflineEdit(alarm: Alarm) {
    if (alarm.id.endsWith("OFFLINE")) {
        postOfflineAlarms()
        return
    }
    try {
        await apiPut(`/api/alarm/${alarm.id}`, alarm)
        const newAlarm = { ...alarm, offline: false }
        const alarms = useStore.getState().alarms
        useStore.setState({ alarms: [...alarms.filter(a => a.id !== newAlarm.id), newAlarm] })
        notification("Edit Alarm", "Offline edited Alarm updated online")
    } catch {
        notification("Edit Alarm", "Offline alarm edit save failed", Status.Error)
    }
}

async function fetchAlarms() {
    const { token } = getCommunicationInfo()
    if (token.length < 3) return
    await postOfflineAlarms()
    try {
        const fetchedAlarms = await apiGet<Array<Alarm>>('/api/alarms')
        let alarms = useStore.getState().alarms
        const newIds = fetchedAlarms.map(a => a.id)
        const oldIds = alarms.map(a => a.id)
        const toRemove = oldIds.filter(id => !newIds.includes(id))
        let change = false
        if (toRemove.length > 0) {
            alarms = alarms.filter(a => !toRemove.includes(a.id))
            change = true
        }
        for (const item of fetchedAlarms) {
            const preFetched = alarms.find(a => a.id === item.id)
            if (preFetched && !isEqual(preFetched, item)) {
                if (preFetched.offline === true && preFetched.modified > item.modified) {
                    await postOfflineEdit(preFetched)
                } else {
                    alarms = [...alarms.filter(a => a.id !== item.id), item]
                    change = true
                }
            } else if (!preFetched) {
                alarms = [...alarms, item]
                change = true
            }
        }
        if (change) {
            useStore.setState({ alarms: uniqueAlarms([...alarms]) })
        }
    } catch (err) {
        const state = useStore.getState()
        if (state.sessionValid !== undefined) {
            notification("Alarms", "Couldn't fetch the alarm list", Status.Error)
        }
    }
}

async function resetSnooze() {
    const { runAlarm, alarms } = useStore.getState()
    if (!runAlarm) return
    const alarm = alarms.find(a => a.id === runAlarm.id)
    if (!alarm) return
    alarm.snooze = [0]
    alarm.fingerprint = useStore.getState().fingerprint
    alarm.modified = Date.now()
    try {
        await apiPut(`/api/alarm/${runAlarm.id}`, alarm)
    } catch {
        alarm.offline = true
    }
    useStore.setState({ alarms: [...alarms.filter(a => a.id !== runAlarm.id), alarm] })
}

async function snoozer() {
    const { runAlarm, alarms } = useStore.getState()
    if (!runAlarm) return
    const alarm = alarms.find(a => a.id === runAlarm.id)
    if (!alarm) return
    const currentMoment = Date.now()
    alarm.snooze = alarm.snooze.filter(s => s > (currentMoment - 60 * 60 * 1000))
    alarm.snooze.push(currentMoment)
    alarm.fingerprint = useStore.getState().fingerprint
    alarm.modified = Date.now()
    try {
        await apiPut(`/api/alarm/${runAlarm.id}`, alarm)
    } catch {
        alarm.offline = true
    }
    useStore.setState({ alarms: [...alarms.filter(a => a.id !== runAlarm.id), alarm] })
}

async function addAlarmFromDialog(alarm: Alarm) {
    if (!alarm) return
    if (!alarm.devices || alarm.devices.length === 0) {
        notification("Add alarm", "No devices set", Status.Error)
        return
    }
    if (alarm.occurrence === AlarmCases.Weekly && alarm.weekdays === 0) {
        notification("Add alarm", "No weekdays set", Status.Error)
        return
    }
    const newAlarm = {
        active:     alarm.active,
        date:       alarm.date,
        devices:    alarm.devices,
        label:      alarm.label,
        occurrence: alarm.occurrence,
        time:       alarm.time,
        weekdays:   alarm.weekdays,
        tune:       alarm.tune,
        fingerprint: useStore.getState().fingerprint,
        modified:   Date.now(),
        snooze:     [0],
        closeTask:  alarm.closeTask,
    }
    switch (alarm.occurrence) {
        case AlarmCases.Weekly: newAlarm.date = [0, 0, 0]; break
        case AlarmCases.Daily:  newAlarm.date = [0, 0, 0]; newAlarm.weekdays = 0; break
        default:                newAlarm.weekdays = 0; break
    }
    const alarms = useStore.getState().alarms
    try {
        const result = await apiPost<{ id: string }>('/api/alarm', newAlarm)
        const alarmWithID = { ...alarm, id: result.id }
        notification("Alarm", "Alarm inserted")
        useStore.setState({ alarms: [...alarms, alarmWithID] })
    } catch {
        const offlineAlarm = {
            ...alarm,
            offline: true,
            id: [...Array(Math.round(Math.random() * 5) + 9)]
                .map(() => Math.floor(Math.random() * 36).toString(36)).join('') +
                Date.now().toString(36) + "OFFLINE",
        }
        useStore.setState({ alarms: [...alarms, offlineAlarm] })
        notification("Edit Alarm", "Alarm edit save failed (offline mode)", Status.Error)
    }
}

async function editAlarmFromDialog(alarm: Alarm) {
    let editDate = [0, 0, 0]
    try { editDate = alarm.date } catch {
        const d = new Date()
        editDate = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    }
    const modAlarm = {
        active:     alarm.active,
        date:       editDate,
        devices:    alarm.devices,
        label:      alarm.label,
        occurrence: alarm.occurrence,
        time:       alarm.time,
        weekdays:   alarm.weekdays,
        id:         alarm.id,
        tune:       alarm.tune,
        fingerprint: useStore.getState().fingerprint,
        modified:   Date.now(),
        closeTask:  alarm.closeTask,
    }
    switch (alarm.occurrence) {
        case AlarmCases.Weekly: modAlarm.date = [0, 0, 0]; break
        case AlarmCases.Daily:  modAlarm.date = [0, 0, 0]; modAlarm.weekdays = 0; break
        default:                modAlarm.weekdays = 0; break
    }
    const alarms = useStore.getState().alarms
    try {
        await apiPut(`/api/alarm/${modAlarm.id}`, modAlarm)
        useStore.setState({ alarms: [...alarms.filter(a => a.id !== modAlarm.id), alarm] })
        notification("Edit Alarm", "Alarm modified")
    } catch {
        useStore.setState({ alarms: [...alarms.filter(a => a.id !== modAlarm.id), { ...alarm, offline: true }] })
        notification("Edit Alarm", "Alarm edit save failed (offline mode)", Status.Error)
    }
}

async function deleteAlarm() {
    const alarms = useStore.getState().alarms
    const id     = useStore.getState().alarmToDelete
    if (!id) return
    if (id.endsWith("OFFLINE")) {
        postOfflineAlarms()
        return
    }
    try {
        await apiDelete(`/api/alarm/${id}`)
        useStore.setState({ alarms: alarms.filter(a => a.id !== id) })
        notification("Delete Alarm", "Alarm removed")
    } catch {
        notification("Delete alarm", "Delete alarm failed not supported offline", Status.Error)
    }
}

async function activityChange(id: string) {
    const alarms = useStore.getState().alarms
    const alarm  = alarms.find(a => a.id === id)
    if (!alarm) return
    alarm.active      = !alarm.active
    alarm.fingerprint = useStore.getState().fingerprint
    alarm.modified    = Date.now()
    alarm.offline     = false
    try {
        if (id.endsWith("OFFLINE")) {
            postOfflineAlarms()
            throw new Error("Offline alarm")
        }
        await apiPut(`/api/alarm/${alarm.id}`, alarm)
        notification("Edit Alarm", "Alarm modified")
        useStore.setState({ alarms: [...alarms.filter(a => a.id !== alarm.id), alarm] })
    } catch (err: unknown) {
        console.error(err)
        useStore.setState({ alarms: [...alarms.filter(a => a.id !== alarm.id), { ...alarm, offline: true }] })
        notification("Edit Alarm", "Alarm edit save failed (using offline)", Status.Error)
    }
}

function timeForNext() {
    const { runAlarm } = useStore.getState()
    const alarmTimeout = useStore.getState().id
    useStore.getState().clearAlarmCounter()
    const time = (runAlarm && alarmTimeout) ? Math.floor(timeToNextAlarm(runAlarm) / 1000) : -1
    if (!alarmTimeout) {
        useStore.getState().setAlarmCounter(
            setTimeout(() => useStore.getState().setTimeForNextLaunch(-1), 5000)
        )
    }
    if (time > 0) {
        const timer = time < 10 ? 300 : time < 60 ? 1000 : time < 3600 ? 2000 : 5000
        useStore.getState().setAlarmCounter(
            setTimeout(() => useStore.getState().setTimeForNextLaunch(time), timer)
        )
    }
}

function runAlarmSet(id: string | undefined, alarms: Array<Alarm>) {
    if (!id) return undefined
    return alarms.find(a => a.id === id)
}

export interface AlarmSlice {
    alarms:            Array<Alarm>
    runAlarm:          Alarm | undefined
    alarmToDelete:     string | undefined
    alarmToEdit:       string | undefined
    toggleActivity:    (id: string) => void
    setAlarmToDelete:  (id: string) => void
    setAlarmToEdit:    (id: string) => void
    fetchAlarms:       () => void
    setRunAlarm:       (id: string | undefined) => void
    editAlarm:         (alarm: Alarm) => void
    deleteAlarm:       () => void
    addNewAlarm:       (alarm: Alarm) => void
    snoozer:           () => void
    resetSnooze:       () => void
    turnOff:           boolean
    setTurnOff:        (bool: boolean) => void
    maxAlarmTime:      number
    timeForNextLaunch: number
    setTimeForNextLaunch: (ms: number) => void
    reloadAlarmList:   boolean
    setReloadAlarmList: () => void
    logo:              string
    clearAlarms:       () => void
}

export const createAlarmSlice: StateCreator<BoundStore, [], [], AlarmSlice> = (set, get) => ({
    alarms:            [],
    runAlarm:          undefined,
    alarmToDelete:     undefined,
    alarmToEdit:       undefined,
    turnOff:           false,
    maxAlarmTime:      maxAlarmTime,
    timeForNextLaunch: -1,
    reloadAlarmList:   false,
    logo:              alarmClock,

    toggleActivity: async (id) => { await activityChange(id) },

    setAlarmToDelete: (id) => {
        const alarms = get().alarms
        const found  = alarms.filter(a => a.id === id)
        set({ alarmToDelete: found.length === 1 ? id : undefined })
    },

    setAlarmToEdit: (id) => {
        const alarms = get().alarms
        const found  = alarms.filter(a => a.id === id)
        set({ alarmToEdit: found.length === 1 ? id : undefined })
    },

    setRunAlarm: (id) => set(state => ({ runAlarm: runAlarmSet(id, state.alarms) })),

    fetchAlarms: async () => { await fetchAlarms() },

    editAlarm: async (alarm) => { await editAlarmFromDialog(alarm) },

    deleteAlarm: async () => { await deleteAlarm() },

    addNewAlarm: async (alarm) => { await addAlarmFromDialog(alarm) },

    snoozer:     async () => { await snoozer() },
    resetSnooze: async () => { await resetSnooze() },

    setTurnOff: (bool) => set({ turnOff: bool }),

    setTimeForNextLaunch: (ms) => {
        if (ms > 0) timeForNext()
        set({ timeForNextLaunch: ms })
    },

    setReloadAlarmList: () => set(state => ({ reloadAlarmList: !state.reloadAlarmList })),

    clearAlarms: () => set({ alarms: [] as Array<Alarm> }),
})
