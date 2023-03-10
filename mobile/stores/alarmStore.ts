import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WeekDay } from '../type'
import { stringifyDate } from '../components/Alarms/AlarmComponents/stringifyDate-Time'
import { timeToNextAlarm } from '../components/Alarms/calcAlarmTime'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import useMessage, { Status } from './messageStore'
import useTimeouts from './timeouts'
import useLogIn from './loginStore'
import { Alarm, AlarmCases } from '../type'
import useServer from './serverStore'

const getCommunicationInfo = () => {
  const server = useServer.getState().address
  const token = useLogIn.getState().token
  return { 
              server: server,
              token: token
         }
}

const notification  = useMessage.getState().notification
const maxAlarmTime = 60*60*1000
const fingerprint = () => useLogIn.getState().fingerprint

type AlarmSerialized = {
    occurence : AlarmCases,
    time: string,
    date: string,
    devices: Array<string>,
    label: string,
    weekdays: Array<WeekDay>,
    active: boolean,
    snooze: Array<number>,
    fingerprint: string,
    modified: number,
    _id: string,
    __v: number
}


interface AlarmSerializedEdit extends AlarmSerialized {
  id: string 
}
const alarmSerializedToAlarm = (alarms: Array<AlarmSerialized>): Array<Alarm> =>{
  
  return alarms.map(alarm => { 
    let newAlarm : Partial<AlarmSerializedEdit> = alarm 
    newAlarm.id = newAlarm._id
    delete newAlarm._id
    delete newAlarm.__v
    newAlarm.weekdays = [...new Set(newAlarm.weekdays)]
    newAlarm.devices = [...new Set(newAlarm.devices)]
    return newAlarm as Alarm
  })
}


const fetchAlarms = async () => {
    let fetchedAlarms = [] as Array<Alarm>
    const {server, token} = getCommunicationInfo()

    try{
        let res = await axios.get(`${server}/api/alarms`,
                {
                    headers: 
                      {
                        token: token
                      }
                }
        )
        fetchedAlarms = alarmSerializedToAlarm(res.data as Array<AlarmSerialized>)
    }catch(err){
        //console.log("Cannot fetch alarms")
        notification( "Couldn't fetch the alarm list",5000, Status.Error)
    }
    useAlarms.setState({ alarms: fetchedAlarms})
}

const resetSnooze = async() => {
  const {server, token} = getCommunicationInfo()
  const runAlarm = useAlarms.getState().runAlarm
  const alarms = useAlarms.getState().alarms
  if(!runAlarm){
    return
  }
  const alarm = alarms.filter(alarm => alarm.id === runAlarm.id)[0]
  if (!alarm){
    return
  }
  alarm.snooze = [0]
  alarm.fingerprint = fingerprint()
  alarm.modified = Date.now()
  try {
    let res = await axios.put(`${server}/api/alarm/`+runAlarm.id, 
                                alarm,  
                                {
                                    headers:
                                            {
                                                token:token
                                            }
                                }
                            )
    //console.log(res.data)
  }catch(err:any){
      //console.log("Couldn't update alarm info ", err)
      return
  }
  let filterAlarms = alarms.filter(alarm => alarm.id !== runAlarm.id)
  useAlarms.setState({alarms: [...filterAlarms,alarm]})
}

const snoozer = async () =>{
  const {server, token} = getCommunicationInfo()
  const runAlarm = useAlarms.getState().runAlarm
  const alarms = useAlarms.getState().alarms
  if(!runAlarm){
    return
  }
  const alarm = alarms.filter(alarm => alarm.id === runAlarm.id)[0]
  if (!alarm){
    return
  }
  let currentMoment = Date.now()
  
  alarm.snooze = alarm.snooze.filter(snooze => snooze > (currentMoment - (60 * 60 * 1000)))
  alarm.snooze.push(currentMoment)
  alarm.fingerprint = fingerprint()
  alarm.modified = Date.now()
  try {
      let res = await axios.put(`${server}/api/alarm/`+runAlarm.id, 
                                  alarm, 
                                  {
                                    headers:
                                            {
                                              token:token
                                            }
                                  }
                                )
      //console.log(res.data)
  }catch(err:any){
      //console.log("Couldn't update alarm info ", err)
      return
  }
  let filterAlarms = alarms.filter(alarm => alarm.id !== runAlarm.id)
  useAlarms.setState({alarms: [...filterAlarms, alarm]})
}


type UseAlarms =  {
  alarms: Array<Alarm>,
  runAlarm: Alarm| undefined,
  runOtherSnooze: boolean,
  toDelete: string| undefined,  
  toEdit: string| undefined,
  toggleActivity: (id:string) => void,
  setToDelete: (id:string) => void,
  setToEdit: (id:string) => void,
  fetchAlarms: ()=> void,
  setRunOtherSnooze: (run:boolean)=> void,
  setRunAlarm :  (ID : string) =>  void,
  insertAlarm: (alarm: Alarm) => void,
  setAlarms: (alarms: Array<Alarm>) => void,
  editAlarm: (alarm: Alarm) => void,
  deleteAlarm: () => void,
  addNewAlarm: (alarm : Alarm) => void,
  snoozer: () => void,
  resetSnooze: () => void,
  maxAlarmTime: number,
  timeForNextLaunch: number,
  setTimeForNextLaunch: (ms:number)=>void,
  reloadAlarmList: boolean,
  setReloadAlarmList: () => void,
  clear: () => void,
}


const addAlarmFromDialog = async (alarm: Alarm) => {
  const {server, token} = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms
  if(!alarm){
    return 
  }

  if(! alarm.devices || alarm.devices.length === 0 ){
    notification( "No devices set",5000, Status.Error)
    return			
  }
  if(( alarm.occurence === AlarmCases.Weekly) && (alarm.weekdays.length === 0) ){
    notification( "No weekdays set", 5000,Status.Error)
    return 
  }
  try {
    let newAlarm = {
      active: alarm.active,
      date: alarm.date,
      devices: alarm.devices,
      label: alarm.label,
      occurence: alarm.occurence,
      time: alarm.time,
      weekdays: alarm.weekdays,
      tone: alarm.tone,
      fingerprint : fingerprint(),
      modified : Date.now()
    }
    switch(alarm.occurence){
      case AlarmCases.Weekly:
        newAlarm.date = ''
        break
      case AlarmCases.Daily:
        newAlarm.date = ''
        newAlarm.weekdays = []
        break
      default:
        newAlarm.weekdays = []
        break
    } 
    const res = await axios.post(
                                `${server}/api/alarm/`, 
                                    newAlarm, 
                                    {
                                      headers: 
                                              {
                                                token: token
                                              }
                                    } 
                                )
    let addedAlarm = res.data.alarm.id as string
    let alarmWithID = alarm
    alarmWithID.id = addedAlarm 
    notification("Alarm inserted",3500, Status.Success)
    
    useAlarms.setState( { alarms: [...alarms, alarmWithID]}) 
  } catch (err:any){
    console.error(err.data)
    notification("Alarm edit save failed",3500, Status.Error)
  }
}

const editAlarmFromDialog = async (alarm: Alarm) => {
  const {server, token} = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms

  try {
    let editDate = ""

    try{
      editDate= alarm.date
    }catch(err){
      editDate=stringifyDate(new Date())
    }
    let modAlarm = {
      active: alarm.active,
      date: editDate,
      devices: alarm.devices,
      label: alarm.label,
      occurence: alarm.occurence,
      time: alarm.time,
      weekdays: alarm.weekdays,
      id: alarm.id,
      tone:alarm.tone,
      fingerprint : fingerprint(),
      modified : Date.now()
    }
    switch(alarm.occurence){
      case AlarmCases.Weekly:
        modAlarm.date = ''
        break
      case AlarmCases.Daily:
        modAlarm.date = ''
        modAlarm.weekdays = []
         break
      default:
        modAlarm.weekdays = []
        break
    } 
    const res = await axios.put(
                                  `${server}/api/alarm/`+modAlarm.id, 
                                    modAlarm,  
                                    {
                                      headers: 
                                                {
                                                  token: token
                                                }
                                    }
                                )

    let oldAlarms = alarms.filter(alarm => alarm.id !== modAlarm.id)
    useAlarms.setState({ alarms: [...oldAlarms, alarm] })
    notification( "Alarm modified", 3500, Status.Success)
  } catch (err){
    console.error(err)
    //notification(
    //              "Edit Alarm",
    //              "Alarm edit save failed",
    //              Status.Error
    //            )
  }
}
 
const insertAlarm = (alarm: Alarm, alarms: Array<Alarm>) => {
  let check = alarms.filter(item => item.id == alarm.id)
  if(check.length ==0){
    return [...alarms, alarm]
  }
  return alarms
}

const setAlarms = (alarms: Array<Alarm>) => {
  let check = [...new Set(alarms.map(item => item.id))]
  if(check.length === alarms.length){
    return alarms
  }
  return [] as Array<Alarm>
}

const runAlarmSet = (id:string, alarms: Array<Alarm>) =>{
  let f = alarms.filter(alarm => alarm.id === id)[0]
  if (f){
    return f
  }
  return undefined
}

const deleteAlarm = async() =>{
  const {server, token} = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms
  let id =  useAlarms.getState().toDelete

  if(!id){
    return
  }
  try {
    //Delete selected alarm id from mongodb
    const res = await axios.delete(
                                  `${server}/api/alarm/`+id,
                                   {
                                    headers:{
                                              token:token
                                            }
                                    }
                                  )
    //console.log(res)
    let filteredAlarms = alarms.filter(alarmItem => alarmItem.id !== id)
    
    notification(  "Alarm removed",3500, Status.Success)
    useAlarms.setState({ alarms: filteredAlarms})
  }catch(err:any){
          //notification("Delete alarm", "Delete alarm failed", Status.Error)
          //console.error(err)
  }
}

const activityChange = async (id: string) => {
  const {server, token} = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms

  try {
      let alarmArr = alarms.filter(alarm => alarm.id === id)
      if(alarmArr.length !== 1){
        throw new Error('Alarm ids are problematic!')
      }
      let alarm = alarmArr[0]
      alarm.active = !alarm.active
      alarm.fingerprint = fingerprint()
      alarm.modified = Date.now()
      const res = await axios.put(
                                    `${server}/api/alarm/`+alarm.id,alarm, 
                                        {
                                          headers: 
                                                  {
                                                    token: token
                                                  }
                                        } 
                                  )
      notification( "Alarm modified",3500, Status.Success)
      let filteredAlarms = alarms.filter(alarmItem => alarmItem.id !== alarm.id)
      useAlarms.setState({ alarms: [...filteredAlarms, alarm] })
  } catch (err:any){
      console.error(err)
      notification( "Alarm edit save failed", 3500,Status.Error)
  }
}
const timeForNext = () => {
  const runAlarm = useAlarms.getState().runAlarm
  const alarmTimeout =  useTimeouts.getState().id
  const setAlarmCounter =  useTimeouts.getState().setAlarmCounter
  useTimeouts.getState().clearAlarmCounter()
  let time = (runAlarm && alarmTimeout)?Math.floor(timeToNextAlarm(runAlarm)/1000):-1 
  if(!alarmTimeout){
    setAlarmCounter(setTimeout(() => useAlarms.getState().setTimeForNextLaunch( -1 ), 5000))
  }
  if(time > 0){
    let timer = 5000
    if(time < 10){
      timer = 300
    }else if(time < 60){
      timer = 1000
    }else if(time < 3600){
      timer = 2000
    }
    setAlarmCounter(setTimeout(() => useAlarms.getState().setTimeForNextLaunch( time ), timer))
  }
}
const useAlarms = create<UseAlarms>()(
    persist(
      (set, get) => (
          {
            alarms: [],
            runAlarm: undefined,
            runOtherSnooze: false,
            toDelete: undefined,
            tone: 'rooster',
            toggleActivity: async (id) => {
              await activityChange(id)
            },
            setToDelete: (id) => {
              let delId : string| undefined = id
              const alarms = useAlarms.getState().alarms
              let f = alarms.filter(alarm => alarm.id === id)
              if(f.length !==1 ){
                delId = undefined
              }
              set(
                  {
                    toDelete: delId
                  }
              )
            },
            toEdit: undefined,
            setToEdit: (id) => {
              let edId : string| undefined = id
              const alarms = useAlarms.getState().alarms
              let f = alarms.filter(alarm => alarm.id === id)
              if(f.length !==1 ){
                edId = undefined
              }
              set(
                  {
                    toEdit: edId
                  }
              )
            },
            setRunOtherSnooze: (run:boolean)=> set(
              {
                runOtherSnooze : run
              }
            ),
            setRunAlarm: (id) => set(
              state => (
                  {
                    runAlarm : runAlarmSet(id,state.alarms)
                  }
              )
            ),
            fetchAlarms: async() => {
              await fetchAlarms()
            },
            insertAlarm: async (alarm) => set(
              state =>(
                  { 
                    alarms: insertAlarm(alarm, state.alarms)
                  }
              )
            ),
            setAlarms: async (alarms) => set(
              {
                alarms: setAlarms(alarms),
              }
            ),
            editAlarm: async (alarm) => { 
                await editAlarmFromDialog(alarm)
            },
            deleteAlarm: async () => {
              await deleteAlarm()
            },
            clear: () => set (
              {
                alarms: [] as Array<Alarm>
              }
            ),
            addNewAlarm: async(alarm) => {
              await addAlarmFromDialog(alarm)
            },
            snoozer: async() => {
                await snoozer()
            },
            resetSnooze: async() =>{
              await resetSnooze()
            },
            maxAlarmTime: maxAlarmTime,
            timeForNextLaunch: -1,
            setTimeForNextLaunch: (ms)=>{
              if(ms > 0){
                timeForNext()
              }
              set(
                  {
                    timeForNextLaunch: ms
                  }
                )
            },
            reloadAlarmList:false,
            setReloadAlarmList:()=>{
              set ( 
                  {
                    reloadAlarmList: !(get().reloadAlarmList)
                  }
                )
            },
          }
      ),

      {
          name: 'alarms', 
          storage: createJSONStorage(() => AsyncStorage), 
          partialize: (state) => (
              { 
                alarms: state.alarms,
              }
          ),
      }
    )
)


export default useAlarms