export enum WeekDay  {
    Monday="Monday",
    Tuesday="Tuesday",
    Wednesday="Wednesday",
    Thursday="Thursday",
    Friday="Friday",
    Saturday="Saturday",
    Sunday="Sunday"
}

export enum Path  {
    PlayAlarm="play-alarm",
    Alarms = "alarms",
    Welcome = "welcome",
    LogIn = "login",
    Register = "register",
    Admin = "admin",
    Clueless="clueless",
    Base= "",
    Activate = "activate",
    Owner = "owner",
    ResetPassword = "reset-password"
}

export enum SessionStatus {
    Activate = "activate",
    NotValid = "not-valid",
    Valid = "valid",
    Unknown = "unknown",
    Validating = "validating"
}

export enum DeviceType {
    Browser = "Browser",
    IoT = "IoT",
    Phone = "Phone",
    Tablet = "Tablet",
    Desktop = "Desktop",
    Other = "Other",
}

export type Device = {
    id: string,
    deviceName: string,
    type: DeviceType
}
export enum ColorMode{
    System = "system",
    Light="light",
    Dark="dark"
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
    owner: boolean,
    active: boolean,
}

export enum AlarmCases {
    Once = "once",
    Daily = "daily",
    Weekly = "weekly",
    Yearly = "yearly",
}

export type Alarm = {
    occurrence : AlarmCases,
    time: [number, number],
    date: [number, number, number],
    devices: Array<string>,
    label: string,
    weekdays: number,
    active: boolean,
    snooze: Array<number>,
    id: string,
    tune: string,
    fingerprint: string,
    modified: number,
    closeTask:boolean,
    offline: boolean
}

export enum CloseTask {
    Obey = "obey",
    Ignore = "ignore",
    Force = "force"
}

export type PasswordReset = {
    email: string,
    password: string,
    confirmPassword:  string,
    passwordResetToken: string,
}

export type QrLoginScan = {
    token: string,
    server: string,
}