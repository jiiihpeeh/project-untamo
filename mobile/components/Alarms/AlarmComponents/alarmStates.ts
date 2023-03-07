import { create } from 'zustand'
import { WeekDay } from '../../../type'
import { timePadding } from "./stringifyDate-Time";
import { numberToWeekDay } from '../calcAlarmTime';
import { useDevices, useLogIn } from '../../../stores';
import { stringifyDate, stringToDate } from './stringifyDate-Time';

export enum AlarmCases {
    Once = "once",
    Daily = "daily",
    Weekly = "weekly",
    Yearly = "yearly",
}

export enum DialogMode {
    Edit,
    Add
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
    let timeArr = `${t}`.split(':');
    let minutes = parseInt(timeArr[1]);
    let hours = parseInt(timeArr[0]);
    if(!isNaN(minutes) && !isNaN(hours)){
        return `${timePadding(hours)}:${timePadding(minutes)}`;
    }else{
        return "00:00";
    }
}

const occurenceDateFormat = (cases:AlarmCases) =>{
    switch(cases){
        case AlarmCases.Once:
            return 'dd.MM.yyy'
        case AlarmCases.Yearly:
            return 'dd.MM'
        default:
            return ''
    }
}

const alarmTimeInit = () => {
	let date = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
	return `${timePadding(date.getHours())}:${timePadding(date.getMinutes())}`;
};


type Alarm = {
    occurence : AlarmCases,
    label : string,
    time : string,
    date : string,
    devices : Array<string>,
    weekdays : Array<WeekDay>,
    active : boolean,
    snooze : Array<number>,
    id : string,
    tone: string,
    fingerprint: string,
    modified: number
}

type AlarmStates = {
    occurence : AlarmCases,
    dateFormat: string,
    setOccurence: (occurence : AlarmCases) => void,
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
    alarm: Alarm|undefined,
    formAlarm: () => void,
    tone: string
    alarmFromDialog: () => Alarm|undefined,
    alarmToEditDialog: (alarm: Alarm) => void,
    showDeleteButton: boolean,
    setShowDeleteButton: (to: boolean) =>void,
    dialogMode: DialogMode,
    setDialogMode: (mode:DialogMode) =>void,
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
        occurence: AlarmCases.Once,
        dateFormat: '',
        modified: 0,
        fingerprint: fingerprint(),
        setOccurence: (occurence) => set( 
            {
                occurence: occurence,
                dateFormat: occurenceDateFormat(occurence),
            }
        ),
        label: "New Alarm",
        setLabel: (label) => set(
            {
                label: label
            }
        ),
        showDeleteButton: false,
        setShowDeleteButton: (to) => {
            set(
                {
                    showDeleteButton: to
                }
            )
        },
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
        onAddOpen: () => set (
            {
                occurence: AlarmCases.Weekly,
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
        alarm: undefined,
        formAlarm: () => set(
            state => (
                {
                    alarm: {
                            occurence : state.occurence,
                            label : state.label,
                            time : state.time,
                            date : stringifyDate(state.date),
                            devices : state.devices,
                            weekdays : state.weekdays,
                            active : state.active,
                            snooze : state.snoozed,
                            id : state.id,
                            tone: state.tone,
                            fingerprint: fingerprint(),
                            modified: Date.now()
                    } as Alarm
                }
            )
        ),
        alarmFromDialog:()=>{
            get().formAlarm()
            return get().alarm
        },
        alarmToEditDialog: ( alarm) => {
            get().setOccurence(alarm.occurence)
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
            if(alarm.occurence === AlarmCases.Once){
                set (
                    {
                        weekdays: [ numberToWeekDay(get().date.getDay()) ]
                    }
                )
            }
        },
        dialogMode: DialogMode.Add,
        setDialogMode: (mode:DialogMode) =>{
            switch(mode){
                case DialogMode.Add:
                    get().setShowDeleteButton(false)
                    break
                default:
                    get().setShowDeleteButton(true)
            }
            set(
                {
                    dialogMode: mode
                }
            )
        },
    }
))


export default useAlarm

