import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { hasOrFetchAudio } from './audioDatabase'
import { invoke } from '@tauri-apps/api/core'

export interface AudioSlice {
    track: string
    tracks: string[]
    plays: boolean
    loop: boolean
    loopPlayBegins: number | null
    playingAlarm: string
    setTrack: (track: string) => void
    setLoop: (to: boolean) => void
    setPlayingAlarm: (alarm: string) => void
    setLoopPlayBegins: (playTime: number | null) => void
    play: () => Promise<void>
    stop: () => void
}

export const createAudioSlice: StateCreator<BoundStore, [], [], AudioSlice> = (set, get) => ({
    track: "rooster",
    tracks: [],
    plays: false,
    loop: false,
    loopPlayBegins: null,
    playingAlarm: "",
    setTrack: (track: string) => {
        const newTrack = get().tracks.includes(track) ? track : "rooster"
        set({ track: newTrack })
    },
    setLoop: (to: boolean) => set({ loop: to }),
    setPlayingAlarm: (alarm: string) => set({ playingAlarm: alarm }),
    setLoopPlayBegins: (playTime: number | null) => set({ loopPlayBegins: playTime }),
    play: async () => {
        const { track, loop } = get()
        const vol = get().volume ?? 1.0
        await hasOrFetchAudio(track)
        const path = await invoke<string>('get_track_path', { track })
        if (!path) {
            console.error('[audio] no file found for track', track)
            return
        }
        await invoke('audio_play', { path, loopAudio: loop, volume: vol })
    },
    stop: () => {
        const { loop } = get()
        invoke('audio_stop').catch(console.error)
        if (loop) { set({ loopPlayBegins: null }) }
    },
})
