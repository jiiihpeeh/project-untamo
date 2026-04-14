import { WeekDay, Alarm, AlarmCases } from "../../type"

function addDays(date: Date, count: number) {
    let calculated = new Date(date.getTime() + (count * (24 * 60 * 60 * 1000)))
    let calculatedHours = calculated.getHours()
    let dateHours = date.getHours()
    if (calculatedHours > dateHours) {
        calculated = new Date(calculated.getTime() - (60 * 60 * 1000))
    } else if (calculatedHours < dateHours) {
        calculated = new Date(calculated.getTime() + (60 * 60 * 1000))
    }
    return calculated
}
    
export function weekDayToNumber(weekDay: WeekDay): number {
    switch (weekDay) {
        case WeekDay.Monday:
            return 1
        case WeekDay.Tuesday:
            return 2
        case WeekDay.Wednesday:
            return 3
        case WeekDay.Thursday:
            return 4
        case WeekDay.Friday:
            return 5
        case WeekDay.Saturday:
            return 6
        case WeekDay.Sunday:
            return 0
        default:
            return 0
    }
}

export function numberToWeekDay(number: number): WeekDay {
    switch (number) {
        case 1:
            return WeekDay.Monday
        case 2:
            return WeekDay.Tuesday
        case 3:
            return WeekDay.Wednesday
        case 4:
            return WeekDay.Thursday
        case 5:
            return WeekDay.Friday
        case 6:
            return WeekDay.Saturday
        case 0:
            return WeekDay.Sunday
        default:
            return WeekDay.Sunday
    }
}

export function dayContinuation(dayNumberList: Array<number>) {
    let dayNumbers = dayNumberList
    dayNumbers.sort(function (a, b) { return a - b })
    let continuation: Array<Array<number>> = []
    for (const num of dayNumbers) {
        let min = num
        let max = num
        while (dayNumbers.includes(max)) {
            max++
        }
        if (min !== max - 1) {
            if (continuation.length > 0) {
                let prev = continuation[continuation.length - 1]
                let prevMax = Math.max(...prev)
                let prevMin = Math.min(...prev)
                if (!(min >= prevMin && (max - 1) <= prevMax)) {
                    continuation.push([min, max - 1])
                }
            } else {
                continuation.push([min, max - 1])
            }
        } else {
            if (continuation.length > 0) {
                let prev = continuation[continuation.length - 1]
                let prevMax = Math.max(...prev)
                let prevMin = Math.min(...prev)
                if (!(min >= prevMin && min <= prevMax)) {
                    continuation.push([min])
                }
            } else {
                continuation.push([min])
            }
        }
    }
    return continuation
}

export function dayContinuationDays(dayList: number) {
    let dayNumberList: Array<number> = []
    //first bit is monday... last bit is sunday
    for (let i = 0; i < 7; i++) {
        if ((dayList & (1 << i)) !== 0) {
            dayNumberList.push(i + 1)
        }
    }
  
    let continuationArr = dayContinuation(dayNumberList)
    let dayContinuationArr: Array<Array<WeekDay>> = []
    for (const c of continuationArr) {
        let subList: Array<WeekDay> = []
        for (const i of c) {
            subList.push(numberToWeekDay((i === 7) ? 0 : i))
        }
        dayContinuationArr.push(subList)
    }
    return dayContinuationArr
}

function initAlarmDate(time: [number,number]) {
    let timeCompare = new Date()
    timeCompare.setHours(time[0])
    timeCompare.setMinutes(time[1])
    timeCompare.setSeconds(0)
    timeCompare.setMilliseconds(0)
    return timeCompare
}

function insertDate(dateObj: Date, date: [number, number, number]) {
    dateObj.setDate(date[2])
    dateObj.setMonth(date[1] - 1)
    dateObj.setFullYear(date[0])
    return dateObj
}

export function nextAlarmOnce(time: [number,number], date: [number, number, number]) {
    let timeNow = new Date()
    let timeCompare = initAlarmDate(time)
    timeCompare = insertDate(timeCompare, date)
    if (timeCompare > timeNow) {
        return timeCompare
    }
    return timeNow
}

export function nextAlarmYearly(time: [number,number], date: [number, number, number]) {
    let timeNow = new Date()
    let timeCompare = initAlarmDate(time)
    timeCompare = insertDate(timeCompare, date)
    let year = timeNow.getFullYear()
    timeCompare.setFullYear(year)
    if (timeCompare > timeNow) {
        return timeCompare
    }
    timeCompare.setFullYear(year + 1)
    return timeCompare
}

export function nextAlarmDaily(time: [number,number]) {
    let timeNow = new Date()
    let timeCompare = initAlarmDate(time)
    if (timeCompare < timeNow) {
        timeCompare = addDays(timeCompare, 1)
    }
    return timeCompare
}

export function nextAlarmWeekly(time: [number,number], weekdays: number) {
    let timeNow = new Date()
    let timeCompare = initAlarmDate(time)
    let dayNumbers: Array<number> = []
    //first bit is monday... last bit is sunday
    for (let i = 0; i < 7; i++) {
        if ((weekdays & (1 << i)) !== 0) {
            dayNumbers.push(i + 1)
        }
    }
    let dayDifferences: Array<number> = []
    let dayNumberNow = timeNow.getDay()
    for (const dayNumber of dayNumbers) {
        let dayDifference = dayNumber - dayNumberNow
        if (dayDifference < 0) {
            dayDifference = 7 + dayDifference
        }
        dayDifferences.push(dayDifference)
    }
    let timeComparisons: Array<number> = []
    for (const dayDifference of dayDifferences) {
        let timeComparison = new Date()
        switch (dayDifference) {
            case 0:
                if (timeCompare < timeNow) {
                    timeComparison = addDays(timeCompare, 7)
                } else {
                    timeComparison = timeCompare
                }
                break
            default:
                timeComparison = addDays(timeCompare, dayDifference)
                break
        }
        timeComparisons.push(timeComparison.getTime())
    }
    let nextAlarm = new Date(Math.min(...timeComparisons))
    return nextAlarm
}

export function timeForNextAlarm(alarm: Alarm) {
    switch (alarm.occurrence) {
        case AlarmCases.Once:
            return nextAlarmOnce(alarm.time, alarm.date)
        case AlarmCases.Daily:
            return nextAlarmDaily(alarm.time)
        case AlarmCases.Weekly:
            return nextAlarmWeekly(alarm.time, alarm.weekdays)
        case AlarmCases.Yearly:
            return nextAlarmYearly(alarm.time, alarm.date)
    }
}

export function timeToNextAlarm(alarm: Alarm) {
    let snoozer = Infinity
    if (!alarm) {
        return snoozer
    }
    let snoozed = alarm.snooze ? alarm.snooze : []
    let timeStamp = Date.now()
    let snoozeMax = Math.min(...snoozed) + (30 * 60 * 1000)
    let snoozeMin = timeStamp - (30 * 60 * 1000)
    if ((Math.max(...snoozed) < snoozeMax) && (Math.min(...snoozed) > snoozeMin)) {
        snoozer = Math.max(...snoozed) + (5 * 60 * 1000)
    }
    let preliminaryAlarm = timeForNextAlarm(alarm)
    if (preliminaryAlarm) {
        let now = Date.now()
        let timeToAlarm = preliminaryAlarm.getTime() - now
        let timeToSnoozer = snoozer - now
        let launchTime = 0
        if (Math.abs(timeToSnoozer) !== Infinity && timeToSnoozer >= 0) {
            launchTime = Math.min(timeToAlarm, timeToSnoozer)
        } else {
            launchTime = timeToAlarm
        }
        return launchTime
    }
    return snoozer
}

export function timeToUnits(time: number) {
    const days = Math.floor(time / (60 * 60 * 24))
    const hours = Math.floor((time - days * (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((time - days * (60 * 60 * 24) - hours * 60 * 60) / (60))
    const seconds = Math.round((time - days * (60 * 60 * 24) - hours * 60 * 60 - minutes * 60))
    return {
        seconds: seconds,
        minutes: minutes,
        hours: hours,
        days: days
    }
}