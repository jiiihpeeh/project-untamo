/// <reference types="vite/client" />
import { DeviceType } from './type.d'

declare type UserInfo = {
    email: string,
    screenName: string,
    firstName: string,
    lastName: string,
    admin: boolean,
    owner: boolean
}

declare type Device = {
    id: string,
    deviceName: string,
    type: DeviceType
}

export enum AlarmCases {
    Once = "once",
    Daily = "daily",
    Weekly = "weekly",
    Yearly = "yearly",
}

export type Alarm = {
    occurence : AlarmCases,
    time: string,
    date: string,
    devices: Array<string>,
    label: string,
    weekdays: Array<WeekDay>,
    active: boolean,
    snooze: Array<number>,
    id: string,
}


export enum WeekDay  {
    Monday="Monday",
    Tuesday="Tuesday",
    Wednesday="Wednesday",
    Thursday="Thursday",
    Friday="Friday",
    Saturday="Saturday",
    Sunday="Sunday"
}
