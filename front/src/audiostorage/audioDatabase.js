import { get, set, del, clear, keys } from './audioDatabaseHandler'
import { blobToBase64String, base64StringToBlob }  from 'blob-util'


export async function audioGet(key) {
    let data = await get(key);
    return base64StringToBlob(data)
}
export async function audioStore(key, val) {
    await set(key, await blobToBase64String(val));
}
export async function audioDel(key) {
    await del(key);
}
export async function audioClear() {
    await clear();
}
export async function audioKeys() {
    return await keys();
}