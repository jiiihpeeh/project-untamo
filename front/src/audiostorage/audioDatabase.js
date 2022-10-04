import { get, set, del, clear, keys } from './audioDatabaseHandler'
import { blobToBase64String, base64StringToBlob }  from 'blob-util'


export async function getAudio(key) {
    let data = await get(key);
    return base64StringToBlob(data)
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
    return keyList.indexOf(key) !== -1
}