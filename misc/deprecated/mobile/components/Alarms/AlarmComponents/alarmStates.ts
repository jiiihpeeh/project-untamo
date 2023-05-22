import { create } from 'zustand'
import { WeekDay } from '../../../type'
import { timePadding } from "./stringifyDate-Time"
import { numberToWeekDay } from '../calcAlarmTime'
import useLogIn from '../../../stores/loginStore'
import useDevices from '../../../stores/deviceStore'
import { stringifyDate, stringToDate } from './stringifyDate-Time'
import { AlarmCases, Alarm } from '../../../type'

export enum DialogMode {
    Edit,
    Add,
}

export enum PickerMode {
    Month,
    Year,
}

const fingerprint = () => useLogIn.getState().fingerprint

const toggleWeekdays = (d : WeekDay, w : Array<WeekDay>) => {
    if(w.includes(d)){
        return w.filter(wd=>wd !== d)
    }
    return [...w,d]
}
const toggleDevices = (d : string|undefined, ds : Array<string>) => {
    if(d && ds.includes(d)){
        return ds.filter(dd=>dd !== d) as Array<string>
    }else if ( d){
        return [...ds,d] as Array<string>
    }
    return ds
}
const timeValue = (t: string) => {
    let timeArr = `${t}`.split(':')
    let minutes = parseInt(timeArr[1])
    let hours = parseInt(timeArr[0])
    if(!isNaN(minutes) && !isNaN(hours)){
        return `${timePadding(hours)}:${timePadding(minutes)}`
    }else{
        return "00:00"
    }
}

const occurrenceDateFormat = (cases:AlarmCases) =>{
    switch(cases){
        case AlarmCases.Once:
            return PickerMode.Month
        case AlarmCases.Yearly:
            return PickerMode.Year
        default:
            return PickerMode.Month
    }
}

const alarmTimeInit = () => {
	let date = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
	return `${timePadding(date.getHours())}:${timePadding(date.getMinutes())}`
}

type AlarmStates = {
    occurrence : AlarmCases,
    setOccurrence: (occurrence : AlarmCases) => void,
    label: string,
    setLabel: (label: string) => void,
    time: string,
    setTime: (time:string) => void,
    date: Date,
    setDate: (d:Date) => void,
    devices: Array<string>,
    setDevices: (deviceIDs:Array<string>) => void,
    toggleDevices: (deviceID:string) => void,
    weekdays: Array<WeekDay>,
    toggleWeekdays: (weekday: WeekDay) => void
    active: boolean,
    setActive: (active: boolean) => void,
    snoozed: Array<number>,
    setSnoozed: (snooze:Array<number>) => void,
    id: string,
    setId: (id:string) =>void,
    onAddOpen: () => void,
    tone: string,
    setTone: (track: string) => void,
    alarmFromDialog: () => Alarm,
    alarmToEditDialog: (alarm: Alarm) => void,
    dialogMode: DialogMode,
    setDialogMode: (mode:DialogMode) =>void,
    pickerMode: PickerMode,
    setPickerMode: (format: PickerMode)=> void
}

const initialDevice = () => {
    let currentDevice = useDevices.getState().currentDevice
    if(currentDevice){
        return [ currentDevice] as Array<string>
    }
    return [] as Array<string>
}

const useAlarm = create<AlarmStates>((set, get) => (
    {
        occurrence: AlarmCases.Once,
        modified: 0,
        fingerprint: fingerprint(),
        setOccurrence: (occurrence) => set( 
            {
                occurrence: occurrence,
                pickerMode: occurrenceDateFormat(occurrence),
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
                    weekdays: [numberToWeekDay(day.getDay())]
                }
            )
        },
        time: "00:00",
        setTime: (time) => set(
            {
                time: timeValue(time)
            }
        ),
        devices: [],
        setDevices: (deviceIds) => set(
                {
                    devices: deviceIds
                }
        ),
        toggleDevices: (id) => set(
            state => (
                {
                    devices: toggleDevices(id, state.devices)
                }
            )
        ),
        weekdays: [],
        toggleWeekdays: (w:WeekDay) => set(
            state =>(
                {
                    weekdays: toggleWeekdays(w, state.weekdays)
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
        tone: 'rooster',
        setTone: (track) =>{
            set(
                {
                    tone: track
                }
            )
        },
        onAddOpen: () => set (
            {
                occurrence: AlarmCases.Weekly,
                weekdays: [ numberToWeekDay(new Date().getDay()) ],
                label: "Alarm",
                time: alarmTimeInit(),
                date: new Date(),
                devices: initialDevice(),
                snoozed: [0],
                id: '',
                active: true,
                tone: 'rooster'
            }
        ),
        alarmFromDialog:()=>{
            return {
                        occurrence : get().occurrence,
                        label : get().label,
                        time : get().time,
                        date : stringifyDate(get().date),
                        devices : get().devices,
                        weekdays : get().weekdays,
                        active : get().active,
                        snooze : get().snoozed,
                        id : get().id,
                        tone: get().tone,
                        fingerprint: fingerprint(),
                        modified: Date.now()
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
                    date: stringToDate(alarm.date),
                    tone: alarm.tone,
                }
            )
            if(alarm.occurrence === AlarmCases.Once){
                set (
                    {
                        weekdays: [ numberToWeekDay(get().date.getDay()) ]
                    }
                )
            }
        },
        dialogMode: DialogMode.Add,
        setDialogMode: (mode:DialogMode) =>{
            set(
                {
                    dialogMode: mode
                }
            )
        },
        pickerMode: PickerMode.Month,
        setPickerMode: (format)=> {
            set(
                {
                    pickerMode: format
                }
            )
        }
    }
))

export default useAlarm