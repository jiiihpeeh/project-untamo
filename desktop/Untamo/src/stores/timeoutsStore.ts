import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { Path } from '../type'
import { urlEnds, sleep } from '../utils'
// circular import — safe: useStore only accessed inside function bodies after init
import { useStore } from './store'

// Daemon — exported so store.ts can call it after create()
export async function compareTime() {
    await sleep(225)
    const currentTime = Date.now()
    if (currentTime - useStore.getState().systemTime > 6000) {
        useStore.getState().clearTimeouts()
        useStore.getState().setReloadAlarmList()
    }
    useStore.getState().setSystemTime(currentTime)
    await sleep(5000)
    compareTime()
}

// Daemon — exported so store.ts can call it after create()
export async function locationChecker() {
    const begins = useStore.getState().loopPlayBegins

    if (urlEnds(Path.PlayAlarm)) {
        if (begins && (Date.now() - begins) > (5 * 60 * 1000)) {
            useStore.getState().setSnoozeIt(true)
        }
    } else {
        useStore.getState().setSnoozeIt(false)
    }

    if (urlEnds(Path.Alarms)) {
        if (begins && useStore.getState().plays) {
            useStore.getState().stop()
        }
    }

    if (urlEnds(Path.Register)) {
        useStore.getState().wsRegisterConnect()
    }

    if (urlEnds(Path.LogIn)) {
        try { useStore.getState().wsRegisterDisconnect() } catch {}
    }

    await sleep(330)
    locationChecker()
}

export interface TimeoutsSlice {
    id:                    NodeJS.Timeout | undefined
    adminID:               NodeJS.Timeout | undefined
    qrID:                  NodeJS.Timeout | undefined
    runAlarmID:            NodeJS.Timeout | undefined
    alarmCounter:          NodeJS.Timeout | undefined
    wsID:                  NodeJS.Timeout | undefined
    alarmOut:              NodeJS.Timeout | null
    refreshTokenTimeout:   NodeJS.Timeout | undefined
    systemTime:            number
    snoozeIt:              boolean
    setId:                   (to: NodeJS.Timeout) => void
    clearIdTimeout:          () => void
    setAdminID:              (to: NodeJS.Timeout) => void
    clearAdminTimeout:       () => void
    setQrID:                 (to: NodeJS.Timeout) => void
    clearQrTimeout:          () => void
    setRunAlarmID:           (to: NodeJS.Timeout) => void
    clearRunAlarmID:         () => void
    setAlarmCounter:         (to: NodeJS.Timeout) => void
    clearAlarmCounter:       () => void
    setSnoozeIt:             (status: boolean) => void
    setWsID:                 (to: NodeJS.Timeout) => void
    clearWsID:               () => void
    setAlarmOut:             (to: NodeJS.Timeout) => void
    clearAlarmOutId:         () => void
    setRefreshTokenTimeout:  (to: NodeJS.Timeout) => void
    setSystemTime:           (to: number) => void
    clearTimeouts:           () => void
}

export const createTimeoutsSlice: StateCreator<BoundStore, [], [], TimeoutsSlice> = (set, get) => ({
    id:                  undefined,
    adminID:             undefined,
    qrID:                undefined,
    runAlarmID:          undefined,
    alarmCounter:        undefined,
    wsID:                undefined,
    alarmOut:            null,
    refreshTokenTimeout: undefined,
    systemTime:          0,
    snoozeIt:            false,

    setId: (to) => set({ id: to }),
    clearIdTimeout: () => {
        const t = get().id
        if (t) { try { clearTimeout(t) } catch {} }
        set({ id: undefined })
    },

    setAdminID: (to) => set({ adminID: to }),
    clearAdminTimeout: () => {
        const t = get().adminID
        if (t) { try { clearTimeout(t) } catch {} }
        set({ adminID: undefined })
    },

    setQrID: (to) => set({ qrID: to }),
    clearQrTimeout: () => {
        const t = get().qrID
        if (t) { try { clearTimeout(t) } catch {} }
        set({ qrID: undefined })
    },

    setRunAlarmID: (to) => set({ runAlarmID: to }),
    clearRunAlarmID: () => {
        const t = get().runAlarmID
        if (t) { try { clearTimeout(t) } catch {} }
    },

    setAlarmCounter: (to) => set({ alarmCounter: to }),
    clearAlarmCounter: () => {
        const t = get().alarmCounter
        if (t) { try { clearTimeout(t) } catch {} }
    },

    setSnoozeIt: (status) => set({ snoozeIt: status }),

    setWsID: (to) => set({ wsID: to }),
    clearWsID: () => {
        const t = get().wsID
        if (t) { try { clearTimeout(t) } catch {} }
        set({ wsID: undefined })
    },

    setAlarmOut: (to) => {
        const t = get().alarmOut
        if (t) { try { clearTimeout(t) } catch {} }
        set({ alarmOut: to })
    },
    clearAlarmOutId: () => {
        const t = get().alarmOut
        if (t) { try { clearTimeout(t) } catch {} }
        set({ alarmOut: null })
    },

    setRefreshTokenTimeout: (to) => {
        const t = get().refreshTokenTimeout
        if (t) { try { clearTimeout(t) } catch {} }
        set({ refreshTokenTimeout: to })
    },

    setSystemTime: (to) => set({ systemTime: to }),

    clearTimeouts: () => {
        [get().id, get().adminID, get().qrID, get().runAlarmID, get().alarmCounter, get().wsID]
            .forEach(t => { if (t) try { clearTimeout(t) } catch {} })
    },
})
