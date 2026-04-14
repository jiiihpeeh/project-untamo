
import { blobToBase64String, base64StringToBlob }  from 'blob-util'
import { getCommunicationInfo, apiGetBlob, apiGet } from './api'
import { notification, Status } from '../components/notification'
import rooster from './rooster.json'
import * as localForage from 'localforage'
import { useStore } from './store'
import { SessionStatus } from '../type'

localForage.config({
    name        : 'untamo',
    storeName   : 'audio', 
    description : 'audiofiles for offline use'
})

export async function getAudio(key: string) {
    const data = await localForage.getItem<string>(key)
    if (!data) throw new Error(`Audio key not found: ${key}`)
    return base64StringToBlob(data)
}

export async function storeAudio(key: string, val: Blob) {
    await localForage.setItem(key, await blobToBase64String(val))
}

export async function delAudio(key: string) {
    await localForage.removeItem(key)
}

export async function keysAudio() {
    return await localForage.keys()
}

export async function hasAudio(key: string) {
    let existing = await keysAudio()
    return existing.indexOf(key) !== -1
}

export async function fetchAudio(audio: string) {
    const { token } = getCommunicationInfo()
    if (token.length > 0 && audio.length > 0) {
        try {
            const blob = await apiGetBlob(`/audio-resources/${audio}.opus`)
            await storeAudio(audio, blob)
        } catch (err) {
            if (useStore.getState().sessionValid === SessionStatus.Valid) { notification("Audio File", `Couldn't download a file ${audio}`, Status.Error) }
        }
    }
}

export async function hasOrFetchAudio(audio: string) {
    if (!await hasAudio(audio)) {
        try {
            await fetchAudio(audio)
        } catch (err) {
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
            let audioTracks: Array<string> = []
            if (audioList.length > 0) {
                for (const audio of audioList) {
                    await hasOrFetchAudio(audio)
                    audioTracks.push(audio)
                }
            }
            useStore.setState({ tracks: audioTracks })
        } catch (err) {
            if (useStore.getState().sessionValid === SessionStatus.Valid) { notification("Alarm sounds", "Failed to get a listing", Status.Error) }
        }
    }
}

export async function deleteAudioDB() {
    await localForage.clear()
}

export async function initAudioDB() {
    await localForage.setItem('rooster', rooster.data64)
} 
