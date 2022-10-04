
import { openDB } from 'idb';


const dbPromise = openDB('audio-store', 1, {
  upgrade(db) {
    db.createObjectStore('audio');
  },
});

export async function get(key) {
  return (await dbPromise).get('audio', key);
}
export async function set(key, val) {
  return (await dbPromise).put('audio', val, key);
}
export async function del(key) {
  return (await dbPromise).delete('audio', key);
}
export async function clear() {
  return (await dbPromise).clear('audio');
}
export async function keys() {
  return (await dbPromise).getAllKeys('audio');
}