import { get, set, del, clear, keys } from './audioDatabaseHandler'
import { blobToBase64String, base64StringToBlob }  from 'blob-util'
import axios from 'axios';


export async function getAudio(key) {
    let data = await get(key);
    return base64StringToBlob(data);
}
export async function storeAudio(key, val) {
    await set(key, await blobToBase64String(val));
}
export async function delAudio(key) {
    await del(key);
}
export async function clearAudio() {
    await clear();
}
export async function keysAudio() {
    return await keys();
}

export async function hasAudio(key) {
    let keyList = await keys();
    return keyList.indexOf(key) !== -1;
}

export async function fetchAudio(audio) {
    //console.log(audio)
    let res = await axios.get(`/resources/${audio}.opus`,{
        responseType: 'blob'
    })
    await storeAudio(audio, res.data);
}

export async function hasOrFetchAudio(audio){
    if (! await hasAudio(audio)){
        await fetchAudio(audio);
    }
}