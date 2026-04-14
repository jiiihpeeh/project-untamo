import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { getAudio, hasOrFetchAudio } from './audioDatabase'

function generateAudioElement(set: (partial: { plays: boolean }) => void) {
    const audioElement = document.createElement('audio')
    audioElement.setAttribute("id", "audioPlayer")
    audioElement.setAttribute("autoplay", "true")
    audioElement.setAttribute("playsinline", "true")

    audioElement.addEventListener("playing", () => {
        set({ plays: true })
    })

    audioElement.addEventListener("pause", () => {
        set({ plays: false })
    })

    audioElement.addEventListener("ended", () => {
        set({ plays: false })
    })

    audioElement.addEventListener("emptied", () => {
        set({ plays: false })
    })
    return audioElement
}

export interface AudioSlice {
    track: string
    tracks: string[]
    plays: boolean
    loop: boolean
    loopPlayBegins: number | null
    playingAlarm: string
    audioElement: HTMLAudioElement
    setTrack: (track: string) => void
    setLoop: (to: boolean) => void
    setPlayingAlarm: (alarm: string) => void
    setLoopPlayBegins: (playTime: number | null) => void
    play: () => Promise<void>
    stop: () => void
}

export const createAudioSlice: StateCreator<BoundStore, [], [], AudioSlice> = (set, get) => {
    const audioElement = generateAudioElement(set)
    
    return {
        track: "rooster",
        tracks: [],
        plays: false,
        loop: false,
        loopPlayBegins: null,
        playingAlarm: "",
        audioElement,
        setTrack: (track: string) => {
            const newTrack = get().tracks.includes(track) ? track : "rooster"
            set({ track: newTrack })
        },
        setLoop: (to: boolean) => set({ loop: to }),
        setPlayingAlarm: (alarm: string) => set({ playingAlarm: alarm }),
        setLoopPlayBegins: (playTime: number | null) => set({ loopPlayBegins: playTime }),
        play: async () => {
            const { track, loop } = get()
            const audioELement = get().audioElement
            const vol = get().volume ?? 1.0
            console.debug('[audio] play() track=%s loop=%s vol=%s', track, loop, vol)
            audioELement.volume = vol
            try {
                const fetched = await hasOrFetchAudio(track)
                console.debug('[audio] hasOrFetchAudio=%s', fetched)
                const blob = await getAudio(track)
                console.debug('[audio] blob size=%s type=%s', blob.size, blob.type)
                const url = URL.createObjectURL(blob)
                if (audioELement.src) {
                    URL.revokeObjectURL(audioELement.src)
                }
                audioELement.src = url
                audioELement.loop = loop
                console.debug('[audio] calling audioElement.play() src=%s', url.substring(0, 30))
                await audioELement.play()
                console.debug('[audio] play() resolved OK')
            } catch (err) {
                console.error('[audio] play() FAILED:', err)
            }
        },
        stop: () => {
            const { loop } = get()
            const audioELement = get().audioElement
            audioELement.pause()
            if (audioELement.src) {
                URL.revokeObjectURL(audioELement.src)
                audioELement.src = ""
            }
            if (loop) {
                set({ loopPlayBegins: null })
            }
        },
    }
}
