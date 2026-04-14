import axios from 'axios'
import { notification, Status } from './components/notification'
import { Path } from './type'


export async function sleep (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
export function isEqual(obj1 :any, obj2 : any) {
    if(obj1 === null && obj2 === null){
        return true
    }
    if(obj1 === undefined && obj2 === undefined){
        return true
    }
    if(!obj1 || !obj2){
        return false
    }
    const obj1Length = Object.keys(obj1).length
    const obj2Length = Object.keys(obj2).length
  
    if (obj1Length === obj2Length) {
        return Object.keys(obj1).every(
            key => obj2.hasOwnProperty(key) && obj2[key] === obj1[key])
    }
    return false
}
export function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export function urlEnds(path: Path) {
    const urlParts = window.location.pathname.split("/").filter(u => u !== "")
    return urlParts[urlParts.length - 1] === path
}

export function timePadding(number: number, numbers = 2) {
    let numberStr = `${number}`
    while (numberStr.length < numbers) {
        numberStr = `0${numberStr}`
    }
    return numberStr
}

export function h24ToH12(n: number) {
    const m = n % 12
    return (m === 0) ? 12 : m
}

export function time24hToTime12h(time: [number, number]) {
    let hours = time[0]
    return {
        time: [h24ToH12(hours),time[1]] as [number,number],
        '12h': (hours > 11 && hours <= 23) ? "PM" : "AM"
    }
}
//generate cryptographically secure random string
export function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    const randomValues = new Uint32Array(length)
    // Generate random values using crypto.getRandomValues()
    crypto.getRandomValues(randomValues)
    let result = ''
    for (let i = 0; i < length; i++) {
      // Map the random values to the character set
      result += characters.charAt(randomValues[i] % charactersLength)
    }
    return result
}


//calculate SHA-512 from a blob
export async function calculateSHA512(blob: Blob): Promise<string> {
    const hash = await crypto.subtle.digest('SHA-512', await blob.arrayBuffer())
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function pingServer(server: string, notify = true) {
    try {
      const res = await axios.get(`${server}/ping`)
      if (res.status === 200) {
        notify  ? notification('Server Ping', 'Server is online', Status.Success ) : null
        return true
      } else {
        notify ? notification('Server Ping', 'Server is not responding', Status.Error ) : null
        return false
      }
    } catch (e) {
        notify ? notification('Server Ping', 'Server is not responding', Status.Error ) : null
        return false
    }
}

export function enumValues<T extends Record<string, string | number>>(
    enumObject: T
  ): Array<T[keyof T]> {
    return Object.values(enumObject) as Array<T[keyof T]>
}

export function getKeyByValue<T>(object: { [key: string]: T }, value: T): string  {
    const k = Object.keys(object).find((key) => object[key] === value)
    return k ? k : ""
}

export function enumToObject<T extends Record<string, string>>(
    enumObj: T
  ): { [key: string]: T[keyof T] } {
    return Object.fromEntries(
      Object.keys(enumObj).map((key) => [
        key,
        enumObj[key as keyof T],
      ])
    )
}