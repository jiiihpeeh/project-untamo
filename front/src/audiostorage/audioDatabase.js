
import { blobToBase64String, base64StringToBlob }  from 'blob-util';
import axios from 'axios';
import { notification } from '../components/notification';
import rooster from './rooster.json'
import localForage from 'localforage';

localForage.config({
    name        : 'untamo',
    storeName   : 'audio', 
    description : 'audiofiles for offline use'
});

export const getAudio = async (key) => {
    let data = await localForage.getItem(key);
    return base64StringToBlob(data);
};
export const storeAudio = async (key, val) => {
    localForage.setItem(key, await blobToBase64String(val));
};
export const delAudio = async (key) => {
    await localForage.removeItem(key);
};

export const keysAudio = async () => {
    return await localForage.keys();
};

export const hasAudio = async (key)  => {
    let existing = await keysAudio()
    return existing.indexOf(key) !== -1;
};

export const fetchAudio = async (audio, token) => {
    //console.log(audio)
    try {
        let res = await axios.get(`http://localhost:3001/audioresources/${audio}.opus`,{
            responseType: 'blob', 
            headers: {'token': token}
        });
        await storeAudio(audio, res.data);
        console.log(`Dowloaded audio: ${audio}`);
    } catch(err){
        console.log(`Couldn't fetch audio ${audio}`);
        notification("Audio File", "Couldn't download a file", "error");
    }
};

export const hasOrFetchAudio = async (audio, token) => {
    if (! await hasAudio(audio,token)){
        try{
            await fetchAudio(audio,token);
        } catch(err){
            return false;
        }
    }
    return true;
};

export const fetchAudioFiles = async (token) => {
    try {
        let res = await axios.get(`http://localhost:3001/audioresources/resource_list.json`,{
            headers: {'token': token}
        });
        for (const audio of res.data){
            await hasOrFetchAudio(audio, token);
        }
    } catch(err){
        console.log(`Couldn't fetch resources listing`);
        notification("Alarm sounds", "Failed to get a listing", "error")
    }
};

export const deleteAudioDB = async () => {
    await localForage.clear();
};

export const initAudioDB = async () => {
    await localForage.setItem('rooster', rooster.data64);
} 
