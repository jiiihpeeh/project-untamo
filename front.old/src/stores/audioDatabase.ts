
import { blobToBase64String, base64StringToBlob }  from 'blob-util'
import axios from 'axios'
import { notification, Status } from '../components/notification'
import rooster from './rooster.json'
import localForage from 'localforage'
import { useLogIn, useServer, useAudio } from '../stores'
import { SessionStatus } from '../type'

function getLocals() {
    const token = useLogIn.getState().token
    const server = useServer.getState().address
    return { token: token, server: server }
}

localForage.config({
    name        : 'untamo',
    storeName   : 'audio', 
    description : 'audiofiles for offline use'
})

export async function getAudio(key: string) {
    let data = await localForage.getItem(key) as string
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
    const { token: token, server: server } = getLocals()
    if (token.length > 0 && audio.length > 0) {
        try {
            let res = await axios.get(`${server}/audio-resources/${audio}.opus`, {
                responseType: 'blob',
                headers: { token: token }
            })
            await storeAudio(audio, res.data)
            //console.log(`Downloaded audio: ${audio}`)
        } catch (err) {
            //console.log(`Couldn't fetch audio ${audio}`)
            (useLogIn.getState().sessionValid === SessionStatus.Valid) ? notification("Audio File", `Couldn't download a file ${audio}`, Status.Error) : {}
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
    const { token: token, server: server } = getLocals()
    if (token) {
        try {
            let res = await axios.get(`${server}/audio-resources/resource_list.json`, {
                headers: { 'token': token }
            });
            let audioTracks: Array<string> = []
            if (res.data.length > 0) {
                for (const audio of res.data) {
                    await hasOrFetchAudio(audio)
                    audioTracks.push(audio)
                }
            }
            //useAlarm.setState({tunes: audioTracks})
            useAudio.setState({ tracks: audioTracks })

        } catch (err) {
            //console.log(`Couldn't fetch resources listing`)
            (useLogIn.getState().sessionValid === SessionStatus.Valid) ? notification("Alarm sounds", "Failed to get a listing", Status.Error) : {}
        }
    }
}

export async function deleteAudioDB() {
    await localForage.clear()
}

export async function initAudioDB() {
    await localForage.setItem('rooster', rooster.data64)
} 
