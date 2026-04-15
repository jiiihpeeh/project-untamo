import { writeFile, readFile, exists, readDir, remove, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs'
import { getCommunicationInfo, apiGet } from './api'
import { fetch } from '@tauri-apps/plugin-http'
import { notification, Status } from '../components/notification'
import rooster from './rooster.json'
import { useStore } from './store'
import { SessionStatus } from '../type'

const AUDIO_DIR = 'audio'
const BASE = BaseDirectory.AppLocalData

async function ensureAudioDir() {
    await mkdir(AUDIO_DIR, { baseDir: BASE, recursive: true })
}

export async function getAudio(key: string): Promise<Blob> {
    const data = await readFile(`${AUDIO_DIR}/${key}.opus`, { baseDir: BASE })
    return new Blob([data], { type: 'audio/ogg; codecs=opus' })
}

async function storeAudioBytes(key: string, data: Uint8Array) {
    await ensureAudioDir()
    await writeFile(`${AUDIO_DIR}/${key}.opus`, data, { baseDir: BASE })
}

export async function delAudio(key: string) {
    await remove(`${AUDIO_DIR}/${key}.opus`, { baseDir: BASE })
}

export async function keysAudio(): Promise<string[]> {
    try {
        await ensureAudioDir()
        const entries = await readDir(AUDIO_DIR, { baseDir: BASE })
        return entries
            .filter(e => e.name?.endsWith('.opus'))
            .map(e => e.name!.slice(0, -5))
    } catch {
        return []
    }
}

export async function hasAudio(key: string): Promise<boolean> {
    try {
        return await exists(`${AUDIO_DIR}/${key}.opus`, { baseDir: BASE })
    } catch {
        return false
    }
}

export async function fetchAudio(audio: string) {
    const { server, token } = getCommunicationInfo()
    if (token.length > 0 && audio.length > 0) {
        try {
            const res = await fetch(`${server}/audio-resources/${audio}.opus`, {
                headers: { token },
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const buffer = await res.arrayBuffer()
            await storeAudioBytes(audio, new Uint8Array(buffer))
        } catch (err) {
            if (useStore.getState().sessionValid === SessionStatus.Valid) {
                notification('Audio File', `Couldn't download a file ${audio}`, Status.Error)
            }
        }
    }
}

export async function hasOrFetchAudio(audio: string): Promise<boolean> {
    if (!await hasAudio(audio)) {
        try {
            await fetchAudio(audio)
        } catch {
            return false
        }
    }
    return true
}

export async function fetchAudioFiles() {
    const { token } = getCommunicationInfo()
    if (token) {
        try {
            const audioList = await apiGet<Array<string>>('/audio-resources/resource_list.json')
            const audioTracks: Array<string> = []
            for (const audio of audioList) {
                await hasOrFetchAudio(audio)
                audioTracks.push(audio)
            }
            useStore.setState({ tracks: audioTracks })
        } catch {
            if (useStore.getState().sessionValid === SessionStatus.Valid) {
                notification('Alarm sounds', 'Failed to get a listing', Status.Error)
            }
        }
    }
}

export async function deleteAudioDB() {
    const keys = await keysAudio()
    for (const key of keys) {
        await delAudio(key).catch(() => {})
    }
}

export async function initAudioDB() {
    await ensureAudioDir()
    if (!await hasAudio('rooster')) {
        const binaryStr = atob(rooster.data64)
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
        await storeAudioBytes('rooster', bytes)
    }
}
