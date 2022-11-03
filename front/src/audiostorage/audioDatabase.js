
import { blobToBase64String, base64StringToBlob }  from 'blob-util';
import axios from 'axios';
import { notification } from '../components/notification';
import rooster from './rooster.json';
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
    await localForage.setItem(key, await blobToBase64String(val));
};
export const delAudio = async (key) => {
    await localForage.removeItem(key);
};

export const keysAudio = async () => {
    return await localForage.keys();
};

export const hasAudio = async (key)  => {
    let existing = await keysAudio();
    return existing.indexOf(key) !== -1;
};

export const fetchAudio = async (audio, token, server) => {
    if(token && audio.length > 0){
        try {
            let res = await axios.get(`${server}/audioresources/${audio}.opus`,{
                responseType: 'blob', 
                headers: {'token': token}
            });
            await storeAudio(audio, res.data);
            console.log(`Dowloaded audio: ${audio}`);
        } catch(err){
            console.log(`Couldn't fetch audio ${audio}`);
            notification("Audio File", "Couldn't download a file", "error");
        }
    }
};

export const hasOrFetchAudio = async (audio, token, server) => {
    if (! await hasAudio(audio,token, server)){
        try{
            await fetchAudio(audio,token, server);
        } catch(err){
            return false;
        }
    }
    return true;
};

export const fetchAudioFiles = async (token, server) => {
    if(token){
        try {
            let res = await axios.get(`${server}/audioresources/resource_list.json`,{
                headers: {'token': token}
            });
            if(res.data.length > 0){
                for (const audio of res.data){
                    await hasOrFetchAudio(audio, token, server);
                }
            }
        } catch(err){
            console.log(`Couldn't fetch resources listing`);
            notification("Alarm sounds", "Failed to get a listing", "error");
        }
    }   
};

export const deleteAudioDB = async () => {
    await localForage.clear();
};

export const initAudioDB = async () => {
    await localForage.setItem('rooster', rooster.data64);
} 
