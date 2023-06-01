import { create } from 'zustand'
import { WeekDay, AlarmCases } from '../../../type'
import { useDevices, useLogIn } from '../../../stores'
import { dateToArr, arrToDate } from './stringifyDate-Time'
import { Alarm } from '../../../type'

export const enum Direction {
    Increase="inc",
    Decrease="dec"
}
function toggleWeekdays(day:number, weekdays:number) {
    const bitmask = 1 << day
    weekdays ^= bitmask
    return weekdays
}

const fingerprint = () => useLogIn.getState().fingerprint

function toggleDevices(d: string | undefined, ds: Array<string>) {
    if (d && ds.includes(d)) {
        return ds.filter(dd => dd !== d) as Array<string>
    } else if (d) {
        return [...ds, d] as Array<string>
    }
    return ds
}
function timeValue(timeArr: [number,number], oldTime: [number,number]) {
    if (timeArr.length !== 2) {
        return oldTime
    }
    let minutes: number
    let hours: number
    try {
        minutes = timeArr[1]
        hours = timeArr[0]
    } catch (err: any) {
        return oldTime
    }
    if (!isNaN(minutes) && !isNaN(hours) && hours < 24 && hours >= 0 && minutes >= 0 && minutes < 60) {
        return [hours, minutes]
    } else {
        return oldTime
    }
}

function changeTime(timeArr: [number,number], direction: Direction, multiplier: number) {
    if (timeArr.length !== 2) {
        return timeArr
    }
    let minutes: number
    let hours: number
    try {
        minutes = timeArr[1]
        hours = timeArr[0]
    } catch (err: any) {
        return timeArr
    }
    let date = new Date()
    date.setHours(hours)
    date.setMinutes(minutes)
    date.setSeconds(0)
    let newDate: number
    switch (direction) {
        case Direction.Decrease:
            newDate = date.getTime() - (multiplier * 60 * 1000)
            break
        case Direction.Increase:
            newDate = date.getTime() + (multiplier * 60 * 1000)
            break
    }
    date.setTime(newDate)
    return [date.getHours(), date.getMinutes()]//`${timePadding(date.getHours())}:${timePadding(date.getMinutes())}`
}


function occurrenceDateFormat(cases: AlarmCases) {
    switch (cases) {
        case AlarmCases.Once:
            return 'dd.MM.yyy'
        case AlarmCases.Yearly:
            return 'dd.MM'
        default:
            return ''
    }
}

function alarmTimeInit() {
    let date = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
    return [date.getHours(), date.getMinutes() ]
}


type AlarmStates = {
    occurrence : AlarmCases,
    dateFormat: string,
    setOccurrence: (occurrence : AlarmCases) => void,
    label: string,
    setLabel: (label: string) => void,
    time: [number, number],
    setTime: (time: [number,number]) => void,
    changeTime:(direction: Direction, multiplier: number) => void,
    date: Date,
    setDate: (d:Date) => void,
    devices: Array<string>,
    setDevices: (deviceIDs:Array<string>) => void,
    closeTask: boolean,
    setCloseTask: (to:boolean) => void,
    toggleDevices: (deviceID:string) => void,
    weekdays: number,
    toggleWeekdays: (day:number) => void
    active: boolean,
    setActive: (active: boolean) => void,
    snoozed: Array<number>,
    setSnoozed: (snooze:Array<number>) => void,
    id: string,
    setId: (id:string) =>void,
    onAddOpen: () => void,
    tune: string
    alarmFromDialog: () => Alarm,
    alarmToEditDialog: (alarm: Alarm) => void,
}

function initialDevice() {
    let currentDevice = useDevices.getState().currentDevice
    if (currentDevice) {
        return [currentDevice] as Array<string>
    }
    return [] as Array<string>
}

const useAlarm = create<AlarmStates>((set, get) => (
    {
        occurrence: AlarmCases.Once,
        dateFormat: '',
        modified: 0,
        fingerprint: fingerprint(),
        setOccurrence: (occurrence) => set( 
            {
                occurrence: occurrence,
                dateFormat: occurrenceDateFormat(occurrence),
            }
        ),
        label: "New Alarm",
        setLabel: (label) => set(
            {
                label: label
            }
        ),
        date: new Date(),
        setDate: (day:Date) =>  {
            set(
                {
                    date: day,
                    weekdays:  toggleWeekdays(day.getDay()-1,0)
                }
            )
        },
        time: [0,0] as [number,number],
        setTime: (time) => set(
            {
                time: timeValue(time, get().time) as [number,number]
            }
        ),
        changeTime:(direction, multiplier) => {
            set(
                {
                    time: changeTime(get().time,direction, multiplier) as [number,number]
                }
            )
        },
        devices: [],
        setDevices: (deviceIds) => set(
                {
                    devices: deviceIds
                }
        ),
        closeTask: false,
        setCloseTask: (to:boolean) => {
            set(
                {
                    closeTask: to
                }
            )
        },
        toggleDevices: (id) => set(
            state => (
                {
                    devices: toggleDevices(id, state.devices)
                }
            )
        ),
        weekdays: 0,
        toggleWeekdays: (day) => set(
            state =>(
                {
                    weekdays: toggleWeekdays(day, state.weekdays)
                }
            )
        ),
        active: true,
        setActive: (active) =>set(
            {
                active: active
            }
        ),
        snoozed: [0],
        setSnoozed: (snooze) => set(
            {
                snoozed: snooze
            }
        ),
        id: "",
        setId: (id) => set(
            {
                id: id
            }
        ),
        tune: 'rooster',
        //tunes: [],
        onAddOpen: () => set (
            {
                occurrence: AlarmCases.Weekly,
                weekdays: toggleWeekdays(new Date().getDay()-1,0),
                label: "Alarm",
                time: alarmTimeInit() as [number,number],
                date: new Date(),
                devices: initialDevice(),
                snoozed: [0],
                id: '',
                active: true,
                tune: 'rooster'
            }
        ),
        alarmFromDialog:()=>{
                return {
                            occurrence : get().occurrence,
                            label : get().label,
                            time : get().time,
                            date : dateToArr(get().date) as [number,number,number],
                            devices : get().devices,
                            weekdays : get().weekdays,
                            active : get().active,
                            snooze : get().snoozed,
                            id : get().id,
                            tune: get().tune,
                            fingerprint: fingerprint(),
                            modified: Date.now(),
                            closeTask: get().closeTask,
                            offline: false
                        }
        },
        alarmToEditDialog: ( alarm) => {
            get().setOccurrence(alarm.occurrence)
            set( 
                {
                    time: alarm.time,
                    weekdays: alarm.weekdays,
                    devices: alarm.devices,
                    id: alarm.id,
                    active: alarm.active,
                    label: alarm.label,
                    snoozed: alarm.snooze,
                    date: arrToDate(alarm.date),
                    tune: alarm.tune,
                    closeTask: alarm.closeTask,
                }
            )
            if(alarm.occurrence === AlarmCases.Once){
                set (
                    {
                        weekdays: toggleWeekdays(get().date.getDay()-1,0)
                    }
                )
            }
        }
    }
))

export default useAlarm