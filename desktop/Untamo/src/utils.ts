import { Path } from './type'
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
export const capitalize = (s:string)=>{
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const urlEnds = (path: Path) => {
    const urlParts = window.location.pathname.split("/").filter(u => u !== "")
    return urlParts[urlParts.length -1] === path
}

export const timePadding = (number:number, numbers = 2) => {
    let numberStr = `${number}`
    while(numberStr.length < numbers){
        numberStr = `0${numberStr}`
    }
    return numberStr
}

export const h24ToH12 = (n:number) => {
    const m = n % 12
    return (m === 0)?12:m
}

export const time24hToTime12h = (time: string) => {
    let timeSplit = time.split(':')
    let hours = parseInt(timeSplit[0])
    return { 
                time: `${timePadding(h24ToH12(hours))}:${timeSplit[1]}`, 
                '12h': (hours >11 && hours <= 23)?"PM":"AM" 
           }
}