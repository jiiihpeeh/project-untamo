import { create } from 'zustand'
import { useAlarms, useLogIn, useDevices } from '../stores'
import { Path } from '../type'
import { urlEnds } from '../utils'
import useAudio from './audioStore'

var systemTime = Date.now()
var timeOut : NodeJS.Timeout

const compareTime = () =>{
    clearTimeout(timeOut)
    const currentTime = Date.now()    
    if(currentTime - systemTime > 6000){
        useTimeouts.getState().clear()
        useAlarms.getState().setReloadAlarmList()
        useAlarms.setState({alarms: [...useAlarms.getState().alarms]})
        useDevices.getState().fetchDevices()
        useLogIn.getState().getUserInfo()
        useAlarms.getState().fetchAlarms()
    }
    systemTime = currentTime
    timeOut = setInterval(compareTime, 5000)
}
compareTime()

type UseTimeout = {
    id: NodeJS.Timeout|undefined,
    setId: (to: NodeJS.Timeout) => void,
    clearIdTimeout: () => void,
    adminID:  NodeJS.Timeout|undefined,
    setAdminID: (to: NodeJS.Timeout) => void,
    clearAdminTimeout: () => void,
    qrID: NodeJS.Timeout|undefined,
    setQrID : (to: NodeJS.Timeout) => void,
    clearQrTimeout: () => void,
    runAlarmID: NodeJS.Timeout|undefined,
    setRunAlarmID: (to: NodeJS.Timeout)=>void,
    clearRunAlarmID: () => void,
    alarmCounter: NodeJS.Timeout|undefined,
    setAlarmCounter: (to: NodeJS.Timeout)=>void,
    clearAlarmCounter: () => void,
    snoozeIt: boolean,
    setSnoozeIt: (status:boolean) => void,
    clear: () => void
}

const clearAlarmTimeout = () => {
    let delTimeOut = useTimeouts.getState().id
        if(delTimeOut){
            try {
                clearTimeout(delTimeOut)
            }catch(err){
               // console.log(err)
        }
    }
}

const clearAdminTimeout = () => {
    let delTimeOut = useTimeouts.getState().adminID
        if(delTimeOut){
            try {
                clearTimeout(delTimeOut)
            }catch(err){
                //console.log(err)
        }
    }
}

const clearQrTimeout = () => {
    let delTimeOut = useTimeouts.getState().qrID
        if(delTimeOut){
            try {
                clearTimeout(delTimeOut)
            }catch(err){
               // console.log(err)
        }
    }
} 

const clearRunAlarmID = () => {
    let delTimeOut = useTimeouts.getState().runAlarmID
        if(delTimeOut){
            try {
                clearTimeout(delTimeOut)
            }catch(err){
               // console.log(err)
        }
    }
} 
const clearAlarmCounter = () => {
    let delTimeOut = useTimeouts.getState().alarmCounter
        if(delTimeOut){
            try {
                clearTimeout(delTimeOut)
            }catch(err){
                //console.log(err)
        }
    }
} 

const useTimeouts = create<UseTimeout>((set,get) => ({
        id: undefined,
        setId: (to) => {
            set( 
                {
                    id: to
                }
            )
        },
        clearIdTimeout: () => {
            clearAlarmTimeout()
            set (
                {
                    id : undefined
                }
            )
        },
        adminID:  undefined,
        setAdminID: (to: NodeJS.Timeout)  => {
            set( 
                {
                    adminID: to
                }
            )
        },
        clearAdminTimeout: () => {
            clearAdminTimeout()
            set (
                {
                    adminID : undefined
                }
            )
        },
        qrID: undefined,
        setQrID : (to: NodeJS.Timeout) => {
            set(
                {
                    qrID: to
                }
            )
        },
        clearQrTimeout: () => {
            clearQrTimeout()
            set(
                {
                    qrID: undefined
                }
            )
        },
        runAlarmID: undefined,
        setRunAlarmID: (to: NodeJS.Timeout)=>{
            set( 
                {
                    runAlarmID: to
                }
            )
        },
        clearRunAlarmID: () => {
            clearRunAlarmID()
        },
        alarmCounter: undefined,
        setAlarmCounter: (to: NodeJS.Timeout)=>{
            set( 
                {
                    alarmCounter: to
                }
            )
        },
        clearAlarmCounter: () => {
            clearAlarmCounter()
        },
        snoozeIt: false,
        setSnoozeIt: (status: boolean) => {
            set(
                {
                    snoozeIt: status
                }
            )
        },
        clear:() =>{
            clearAlarmTimeout()
            clearAdminTimeout()
            clearQrTimeout()
            clearRunAlarmID()
            clearAlarmCounter()
        },

    }
))

let alarmToSnooze : NodeJS.Timeout
let locationId : NodeJS.Timeout
let location = window.location.pathname
let newLocation = ""
//useTimeouts.getState().setSnoozeIt(false)
const locationChecker = () => {
    // clearTimeout(locationId)
    // newLocation = window.location.pathname

    // if(urlEnds(Path.PlayAlarm)){
    //     //console.log("location trigger play alarm")
    //     if(!useTimeouts.getState().snoozeIt){
    //         alarmToSnooze = setTimeout(() => { useTimeouts.getState().setSnoozeIt(true)
    //         }, 5*60*1000)       
    //     }

    // }else if (!urlEnds(Path.PlayAlarm)){ 
    //     //console.log("location trigger not play alarm")
    //     clearTimeout(alarmToSnooze)
    //     useTimeouts.getState().setSnoozeIt(false)
    // }
    // if(urlEnds(Path.Alarms)){
    //     //console.log("location trigger  alarm")
    //     if( useAudio.getState().plays && !useAlarms.getState().turnOff){
    //         if(urlEnds(Path.Alarms)){
    //             useAudio.getState().stop()
    //         }
    //     }
    // }
    location = newLocation

    locationId = setTimeout(locationChecker,500) 
}

locationChecker()

export default useTimeouts 