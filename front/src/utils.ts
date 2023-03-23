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