import { create } from 'zustand'
import { useAlarms, useLogIn, useDevices } from '../stores'
import { urlEnds, sleep } from '../utils'
import useAudio from './audioStore'
import useServer from './serverStore'
import { Path } from '../type'

const compareTime = async() =>{
    await sleep(225)
    const currentTime = Date.now()    
    if(currentTime - useTimeouts.getState().systemTime > 6000){
        useTimeouts.getState().clear()
        useAlarms.getState().setReloadAlarmList()
        useServer.getState().wsActionReconnect()
    }
    useTimeouts.getState().setSystemTime(currentTime)
    await sleep(5000)
    compareTime()
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
    wsID: NodeJS.Timeout|undefined,
    setWsID: (to: NodeJS.Timeout) => void,
    alarmOut : NodeJS.Timeout|null,
    setAlarmOut: (to: NodeJS.Timeout) => void,
    clearAlarmOutId: () => void,
    systemTime: number,
    setSystemTime: (to: number) => void,
    clearWsID: () => void,
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
const  clearWsId = () => {
    let delTimeOut = useTimeouts.getState().wsID
    if(delTimeOut){
            try {   
                clearTimeout(delTimeOut)
            }catch(err){
                //console.log(err)
        }
    }
}

const clearAlarmOutId = () => {
    let delTimeOut = useTimeouts.getState().alarmOut
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
        wsID: undefined,
        setWsID: (to: NodeJS.Timeout) => {
            set(
                {
                    wsID: to
                }
            )
        },
        clearWsID: () => {
            clearWsId()
            set(
                {
                    wsID: undefined
                }
            )
        },
        alarmOut : null,
        setAlarmOut: (to: NodeJS.Timeout) => {
            clearAlarmOutId()
            set(
                    {
                        alarmOut: to
                    }
                )
        },
        clearAlarmOutId: () => () =>{
            clearAlarmOutId()
            set({alarmOut: null})

        },
        systemTime: 0,
        setSystemTime: (to: number) => {
            set(
                {
                    systemTime: to
                }
            )
        },
        clear:() =>{
            clearAlarmTimeout()
            clearAdminTimeout()
            clearQrTimeout()
            clearRunAlarmID()
            clearAlarmCounter()
            clearWsId()
        },

    }
))


async function locationChecker() {
    let begins = useAudio.getState().loopPlayBegins

    if(urlEnds(Path.PlayAlarm)){
        //console.log("location trigger play alarm")
        if(begins && (Date.now() - begins) > (5 * 60 * 1000)){
            useTimeouts.getState().setSnoozeIt(true)
        }
    }else if (!urlEnds(Path.PlayAlarm)){ 
        //console.log("location trigger not play alarm")
        useTimeouts.getState().setSnoozeIt(false)
    }
    if(urlEnds(Path.Alarms)){
        //console.log("location trigger  alarm")
        if(begins && useAudio.getState().plays ){
            if(urlEnds(Path.Alarms)){
                useAudio.getState().stop()
            }
        }
    }
    if(urlEnds(Path.Register)){
        useServer.getState().wsRegisterConnect()
    }
    if(urlEnds(Path.LogIn)){
        useServer.getState().wsRegisterDisconnect()
        //useLogIn.getState().setSessionValid(SessionStatus.NotValid)
    }
    await sleep(330)
    locationChecker()
}
locationChecker()

export default useTimeouts