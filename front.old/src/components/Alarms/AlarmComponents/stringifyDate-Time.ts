import { timePadding } from "../../../utils"

export function dateToArr(date: Date){
    let year = date.getFullYear()
    let currentYear = new Date().getFullYear()
    if(isNaN(year)){
        year = new Date().getFullYear()
    }
    if(year < currentYear -1){
        year = currentYear
    }
    let dayNumber = date.getDay()
    if(isNaN(dayNumber)){
        dayNumber = new Date().getDay()
    }
    if(dayNumber < 1){
        dayNumber = 1
    }
    return [year, date.getMonth() + 1, dayNumber]
}

export function arrToDate(dateArr: [number, number, number]) {
    let year = dateArr[0]
    let currentYear = new Date().getFullYear()
    if(isNaN(year)){
        year = new Date().getFullYear()
    }
    if(year < currentYear -1){
        year = currentYear
    }
    let month = dateArr[1] - 1
    if(isNaN(month) ||  month < 0 || month > 11){
        month = new Date().getMonth()
    }
    let day = dateArr[2]
    if(isNaN(day) || day < 1 || day > 31){
        day = 15
    }
    let date = new Date()
    try {
        date.setFullYear(year)
        date.setMonth(month)
        date.setDate(day)
    } catch {
        date = new Date()
    }
    return date
}

export function parseDate(dateArr: [number, number, number]) {
    if (dateArr.length === 3) {
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