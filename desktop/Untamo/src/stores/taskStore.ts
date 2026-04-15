import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'

export enum LaunchMode {
    None = "none",
    Snooze = "snooze",
    TurnOff = "turnOff",
}

export interface TaskSlice {
    solved: boolean
    launchMode: LaunchMode
    setLaunchMode: (launchMode: LaunchMode) => void
    setSolved: (solved: boolean) => void
}

export const createTaskSlice: StateCreator<BoundStore, [], [], TaskSlice> = (set) => ({
    solved: false,
    launchMode: LaunchMode.None,
    setLaunchMode: (mode) => set({ launchMode: mode }),
    setSolved: (solved) => set({ solved }),
})
