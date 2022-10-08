import { get, set, del, clear, keys } from './audioDatabaseHandler';
import { blobToBase64String, base64StringToBlob }  from 'blob-util';
import axios from 'axios';

const token = localStorage['token'];

export const getAudio = async (key) => {
    let data = await get(key);
    return base64StringToBlob(data);
};
export const storeAudio = async (key, val) => {
    await set(key, await blobToBase64String(val));
};
export const delAudio = async (key) => {
    await del(key);
};
export const clearAudio = async () => {
    await clear();
};
export const keysAudio = async () => {
    return await keys();
};

export const hasAudio = async (key)  => {
    let keyList = await keys();
    return keyList.indexOf(key) !== -1;
};

export const fetchAudio = async (audio) => {
    //console.log(audio)
    try {
        let res = await axios.get(`/audioresources/${audio}.opus`,{
            responseType: 'blob', 
            headers: {'token': token}
        });
        await storeAudio(audio, res.data);
        console.log(`Dowloaded audio: ${audio}`)
    } catch(err){
        console.log(`Couldn't fetch audio ${audio}`);
    }
};

export const hasOrFetchAudio = async (audio) => {
    if (! await hasAudio(audio)){
        await fetchAudio(audio);
    }
};

export const fetchAudioFiles = async () => {
    try {
        let res = await axios.get(`/audioresources/resource_list.json`,{
            headers: {'token': token}
        });
        for (const audio of res.data){
            hasOrFetchAudio(audio);
        }
    } catch(err){
        console.log(`Couldn't fetch resources listing`);
    }
};

// export const clearAudioFiles = async () => {
//     let audioKeys = await keysAudio();
//     for (const audio of audioKeys){

//     }

// };