
import { blobToBase64String, base64StringToBlob }  from 'blob-util';
import axios from 'axios';
import { notification, Status } from '../components/notification';
import rooster from './rooster.json';
import localForage from 'localforage';
import { useLogIn, useServer, useAudio } from '../stores'

const getLocals = () => {
    const token = useLogIn.getState().token
    const server = useServer.getState().address
    return { token: token, server: server}
}


localForage.config({
    name        : 'untamo',
    storeName   : 'audio', 
    description : 'audiofiles for offline use'
})

export const getAudio = async (key: string) => {
    let data = await localForage.getItem(key) as string;
    return base64StringToBlob(data);
}

export const storeAudio = async (key: string, val:Blob) => {
    await localForage.setItem(key, await blobToBase64String(val));
}

export const delAudio = async (key: string) => {
    await localForage.removeItem(key);
}

export const keysAudio = async () => {
    return await localForage.keys();
}

export const hasAudio = async (key: string)  => {
    let existing = await keysAudio();
    return existing.indexOf(key) !== -1;
}

export const fetchAudio = async (audio: string) => {
    const { token: token, server: server }  = getLocals()
    

    if(token.length > 0 && audio.length > 0){
        try {
            let res = await axios.get(`${server}/audio-resources/${audio}.opus`,{
                responseType: 'blob', 
                headers: {token: token}
            });
            await storeAudio(audio, res.data);
            //console.log(`Dowloaded audio: ${audio}`);
        } catch(err){
            //console.log(`Couldn't fetch audio ${audio}`);
            notification("Audio File", `Couldn't download a file ${audio}`, Status.Error);
        }
    }
}

export const hasOrFetchAudio = async (audio :string) => {

    if (! await hasAudio(audio)){
        try{
            await fetchAudio(audio);
        } catch(err){
            return false;
        }
    }
    return true;
}

export const fetchAudioFiles = async () => {
    const { token: token, server: server }  = getLocals()

    if(token){
        try {
            let res = await axios.get(`${server}/audio-resources/resource_list.json`,{
                headers: {'token': token}
            });
            let audioTracks: Array<string> = []
            if(res.data.length > 0){
                for (const audio of res.data){
                    await hasOrFetchAudio(audio);
                    audioTracks.push(audio)
                }
            }
            //useAlarm.setState({tones: audioTracks})
            useAudio.setState({tracks: audioTracks})

        } catch(err){
            //console.log(`Couldn't fetch resources listing`);
            notification("Alarm sounds", "Failed to get a listing", Status.Error);
        }
    }   
};

export const deleteAudioDB = async () => {
    await localForage.clear();
}

export const initAudioDB = async () => {
    await localForage.setItem('rooster', rooster.data64);
} 
