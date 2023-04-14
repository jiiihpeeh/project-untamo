import { notification, Status } from '../components/notification';
import { useLogIn, useServer, useAudio } from '../stores'
import { Body, getClient, ResponseType } from "@tauri-apps/api/http"
import { writeBinaryFile,  removeFile } from '@tauri-apps/api/fs'
import { join } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri'

const getLocals = () => {
    const token = useLogIn.getState().token
    const server = useServer.getState().address
    return { token: token, server: server}
}

export async function getAudioPath(key: string){
    return await invoke("get_track_path", {track: key})
}

async function getAudioDir(){
    let audio_path = await (invoke("get_audio_app_path") as Promise<string>)
    if(audio_path.length > 0){
        return audio_path
    }
    return ""
}

export async function storeAudio(key: string, val:Uint8Array){
    const audioDir = await getAudioDir()
    const audioFile = await join(audioDir, `${key}.flac`)
    try{
        await writeBinaryFile(audioFile, val)
    }catch(err){
        console.log(err)
    }
}

export async function delAudio(key: string) {
    await removeFile(await join(await getAudioDir(), `${key}.flac`))
    await keysAudio()
}

export async function keysAudio(){
    let tracks = await invoke("get_tracks") as Array<string>
    //console.log(tracks)
    if(tracks.length === 0){
        await fetchAudioFiles()
        tracks = await invoke("get_tracks")
    }
    return tracks
}

export async function hasAudio(key: string) {
    let existing = await keysAudio()
    return existing.includes(key)
}

export async function fetchAudio(audio: string) {
    const { token: token, server: server } = getLocals()
    if (token.length > 0 && audio.length > 0) {
        try {
            const client = await getClient();
            const response = await client.request(
                {
                    method: 'GET',
                    url: `${server}/audio-resources/${audio}.flac`,
                    responseType: ResponseType.Binary,
                    headers: { 'token': token }
                }
            )
            await storeAudio(audio, response.data as Uint8Array)
            return true
        } catch (err) {
            notification("Audio File", `Couldn't download a file ${audio}`, Status.Error)    
        }
    }
    return false
}

export async function hasOrFetchAudio(audio: string) {
    if (!await hasAudio(audio)) {
        try {
            return await fetchAudio(audio);
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
            const client = await getClient();
            const response = await client.request(
                                                    {
                                                        method: 'GET',
                                                        url: `${server}/audio-resources/resource_list.json`,
                                                        responseType: ResponseType.JSON,
                                                        headers: { 'token': token }
                                                    }
                                                )
            const data = response.data as Array<string>
            let audioTracks: Array<string> = []
            if (data.length > 0) {
                for (const audio of data) {
                    await hasOrFetchAudio(audio) && audioTracks.push(audio)
                }
            }
            useAudio.setState({ tracks: audioTracks })
        } catch (err) {
            console.log(err);
            notification("Alarm sounds", "Failed to get a listing", Status.Error)
        }
    }
}

export async function deleteAudioDB() {
    let keys = await keysAudio()
    if(!keys){
        return
    }
    for(const key of keys){
        key?await delAudio(key):{}
    }
}

export const initAudioDB = async () => {
    //await localForage.setItem('rooster', rooster.data64);
} 
