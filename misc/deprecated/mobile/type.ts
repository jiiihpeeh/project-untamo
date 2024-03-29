export enum WeekDay  {
    Monday="Monday",
    Tuesday="Tuesday",
    Wednesday="Wednesday",
    Thursday="Thursday",
    Friday="Friday",
    Saturday="Saturday",
    Sunday="Sunday"
}

export enum SessionStatus {
    NotValid = 0,
    Valid,
    Unknown
}

export enum DeviceType {
    Browser = "Browser",
    IoT = "IoT",
    Phone = "Phone",
    Tablet = "Tablet",
    Desktop = "Desktop",
    Other = "Other"
}
export type Device = {
    id: string,
    deviceName: string,
    type: DeviceType
}
export interface FormData{
	firstName: string,
	lastName: string,
	email: string,
	screenName: string,
	password: string,
	change_password: string,
	confirm_password: string
}
export enum OpenDeviceDialog{
    Menu = "menu",
    Other = "other"
}
export enum AdminAction {
    Activity= 'activity',
    Admin= "admin",
    Delete="delete"
}


export declare type UserInfo = {
    email: string,
    screenName: string,
    firstName: string,
    lastName: string,
    admin: boolean,
    owner: boolean
}



export enum AlarmCases {
    Once = "once",
    Daily = "daily",
    Weekly = "weekly",
    Yearly = "yearly",
}

export type Alarm = {
    occurrence : AlarmCases,
    time: string,
    date: string,
    devices: Array<string>,
    label: string,
    weekdays: Array<WeekDay>,
    active: boolean,
    snooze: Array<number>,
    id: string,
    tone: string,
    fingerprint: string,
    modified: number
}

