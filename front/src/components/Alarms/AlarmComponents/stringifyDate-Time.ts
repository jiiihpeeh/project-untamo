import { timePadding } from "../../../utils"

export const dateToArr = (date: Date) => {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}
export const arrToDate = (dateArr: [number,number,number]) => {
    let date = new Date()
    try{
        let dateNumber = [ dateArr[0],dateArr[1] -1,dateArr[2]]
        for (const item of dateNumber){
            if(isNaN(item)){
                return date
            }
        }
        date.setFullYear(dateNumber[0])
        date.setMonth(dateNumber[1])
        date.setDate(dateNumber[2])
    }catch{
        date = new Date()
    }
    return date	
}

export const parseDate = (dateArr: [number, number, number]) => {
    if(dateArr.length === 3){
        let year = dateArr[0]
        let month = dateArr[1] - 1
        let day = dateArr[2]
        let date = new Date()
        date.setFullYear(year)
        date.setMonth(month)
        date.setDate(day)
        return date
    }
}


export function stringifyDate(date: Date){
    return `${timePadding(date.getFullYear(),4)}-${timePadding(date.getMonth() + 1)}-${timePadding(date.getDate())}`
}

export function stringifyDateArr(date: [number,number,number]) {
    return `${timePadding(date[0],4)}-${timePadding(date[1])}-${timePadding(date[2])}`
}

export function stringifyTime(time: [number,number]) {
    return `${timePadding(time[0])}:${timePadding(time[1])}`
}