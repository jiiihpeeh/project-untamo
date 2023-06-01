import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WeekDay, Alarm, AlarmCases } from '../type'
import { notification, Status } from '../components/notification'
import { getCommunicationInfo, validSession } from '../stores'
import useTimeouts from './timeoutsStore'
import useLogIn from './loginStore'
import { stringifyDate } from '../components/Alarms/AlarmComponents/stringifyDate-Time'
import { timeToNextAlarm } from '../components/Alarms/calcAlarmTime'
import alarmClockString from './logo.svg?raw'
import { isEqual, sleep, isSuccess  } from '../utils'
import { Body, getClient, ResponseType } from "@tauri-apps/api/http"

const alarmClock = URL.createObjectURL(new Blob([alarmClockString], {type: 'image/svg+xml'}))


const maxAlarmTime = 60*60*1000
const fingerprint = () => useLogIn.getState().fingerprint

export function uniqueAlarms(alarms: Array<Alarm>) {
  let unique = alarms.filter((alarm, index, self) =>
    index === self.findIndex((t) => (
      t.id === alarm.id
    ))
  )
  return unique
}


async function fetchAlarms() {
  let fetchedAlarms: Array<Alarm> = []
  const { server, token } = getCommunicationInfo()
  if (token.length < 3) {
    return
  }
  await postOfflineAlarms()
  try {
    const client = await getClient()
    const res = await client.request(
      {
        method: "GET",
        url: `${server}/api/alarms`,
        headers: {
          token: token
        }
      }
    )
    isSuccess(res)
    fetchedAlarms = res.data as Array<Alarm> //alarmSerializedToAlarm(res.data as Array<AlarmSerialized>)
    let alarms = useAlarms.getState().alarms
    const newIds = fetchedAlarms.map(alarm => alarm.id)
    const oldIds = alarms.map(alarm => alarm.id)
    const toDelete = oldIds.filter(id => !newIds.includes(id))
    let change = false
    if (toDelete.length > 0) {
      alarms = alarms.filter(alarm => !toDelete.includes(alarm.id))
      change = true
    }
    for (const item of fetchedAlarms) {
      let preFetched = alarms.filter(alarm => alarm.id === item.id)[0]

      if (preFetched && !isEqual(preFetched, item)) {
        if (preFetched.offline === true && preFetched.modified > item.modified) {
          await postOfflineEdit(preFetched)
        } else {
          alarms = [...alarms.filter(alarm => alarm.id !== item.id), item]
          change = true
        }

      } else if (!preFetched) {
        alarms = [...alarms, item]
        change = true
      }
    }
    if (change) {
      useAlarms.setState({ alarms: uniqueAlarms([...alarms]) })
    }
  } catch (err) {
    //console.log("Cannot fetch alarms")
    (validSession()) ? notification("Alarms", "Couldn't fetch the alarm list", Status.Error) : {}
  }
}

async function resetSnooze() {
  const { server, token } = getCommunicationInfo()
  const runAlarm = useAlarms.getState().runAlarm
  const alarms = useAlarms.getState().alarms
  if (!runAlarm) {
    return
  }
  const alarm = alarms.filter(alarm => alarm.id === runAlarm.id)[0]
  if (!alarm) {
    return
  }
  alarm.snooze = [0]
  alarm.fingerprint = fingerprint()
  alarm.modified = Date.now()
  try {
    const client = await getClient()
    const res = await client.request(
      {
        url: `${server}/api/alarm/` + runAlarm.id,
        method: "PUT",
        headers: {
          token: token
        },
        body: Body.json(alarm)
      }
    )

    //console.log(res.data)
    isSuccess(res)
  } catch (err: any) {
    //console.log("Couldn't update alarm info ", err)
    //return
    alarm.offline = true
  }
  let filterAlarms = alarms.filter(alarm => alarm.id !== runAlarm.id)
  useAlarms.setState({ alarms: [...filterAlarms, alarm] })
}

async function snoozer() {
  const { server, token } = getCommunicationInfo()
  const runAlarm = useAlarms.getState().runAlarm
  const alarms = useAlarms.getState().alarms
  if (!runAlarm) {
    return
  }
  const alarm = alarms.filter(alarm => alarm.id === runAlarm.id)[0]
  if (!alarm) {
    return
  }
  let currentMoment = Date.now()

  alarm.snooze = alarm.snooze.filter(snooze => snooze > (currentMoment - (60 * 60 * 1000)))
  alarm.snooze.push(currentMoment)
  alarm.fingerprint = fingerprint()
  alarm.modified = Date.now()
  try {
    const client = await getClient()
    const res = await client.request(
      {
        url: `${server}/api/alarm/` + runAlarm.id,
        method: "PUT",
        headers: {
          token: token
        },
        body: Body.json(alarm)
      }
    )
    //console.log(res.data)
    isSuccess(res)
  } catch (err: any) {
    //console.log("Couldn't update alarm info ", err)
    //return
    alarm.offline = true
  }
  let filterAlarms = alarms.filter(alarm => alarm.id !== runAlarm.id)
  useAlarms.setState({ alarms: [...filterAlarms, alarm] })
}


type UseAlarms =  {
  alarms: Array<Alarm>,
  runAlarm: Alarm| undefined,
  toDelete: string| undefined,  
  toEdit: string| undefined,
  toggleActivity: (id:string) => void,
  setToDelete: (id:string) => void,
  setToEdit: (id:string) => void,
  fetchAlarms: ()=> void,
  setRunAlarm :  (ID : string|undefined) =>  void,
  editAlarm: (alarm: Alarm) => void,
  deleteAlarm: () => void,
  addNewAlarm: (alarm : Alarm) => void,
  snoozer: () => void,
  resetSnooze: () => void,
  turnOff: boolean,
  setTurnOff: (bool:boolean) => void,
  maxAlarmTime: number,
  timeForNextLaunch: number,
  setTimeForNextLaunch: (ms:number)=>void,
  reloadAlarmList: boolean,
  setReloadAlarmList: () => void,
  logo: string,
  clear: () => void,
}


async function addAlarmFromDialog(alarm: Alarm) {
  const { server, token } = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms
  if (!alarm) {
    return
  }

  if (!alarm.devices || alarm.devices.length === 0) {
    notification("Add alarm", "No devices set", Status.Error)
    return
  }
  if ((alarm.occurrence === AlarmCases.Weekly) && (alarm.weekdays === 0)) {
    notification("Add alarm", "No weekdays set", Status.Error)
    return
  }
  let newAlarm = {
    active: alarm.active,
    date: alarm.date,
    devices: alarm.devices,
    label: alarm.label,
    occurrence: alarm.occurrence,
    time: alarm.time,
    weekdays: alarm.weekdays,
    tune: alarm.tune,
    fingerprint: fingerprint(),
    modified: Date.now(),
    closeTask: alarm.closeTask
  }
  switch (alarm.occurrence) {
    case AlarmCases.Weekly:
      newAlarm.date = [0,0,0]
      break
    case AlarmCases.Daily:
      newAlarm.date = [0,0,0]
      newAlarm.weekdays = 127
      break
    default:
      newAlarm.weekdays = 0
      break
  }
  try {
    const client = await getClient()
    const res = await client.request(
      {
        url: `${server}/api/alarm`,
        method: "POST",
        headers: {
          token: token
        },
        body: Body.json(newAlarm),
        responseType: ResponseType.JSON
      }
    )

    interface Data {
      alarm: Alarm
    }
    let dataAlarm = res.data as Alarm
    //let dataAlarm = data.alarm  
    let addedAlarm = dataAlarm.id as string
    let alarmWithID = alarm
    alarmWithID.id = addedAlarm
    notification("Alarm", "Alarm inserted")

    useAlarms.setState({ alarms: [...alarms, alarmWithID] })

  } catch (err: any) {
    //console.error(err.data)
    alarm.offline = true
    alarm.id = [...Array(Math.round(Math.random() * 5) + 9)].map(() => Math.floor(Math.random() * 36).toString(36)).join('') + Date.now().toString(36) + "OFFLINE"
    useAlarms.setState({ alarms: [...alarms, alarm] })
    notification("Edit Alarm", "Alarm edit save failed (offline mode)", Status.Error)
  }
}

async function editAlarmFromDialog(alarm: Alarm) {
  const { server, token } = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms
  let editDate = [0,0,0]

  try {
    editDate = alarm.date
  } catch (err) {
    let newDate = new Date()
    editDate = [ newDate.getFullYear(), newDate.getMonth()+1,newDate.getDate()]
  }
  let modAlarm = {
    active: alarm.active,
    date: editDate,
    devices: alarm.devices,
    label: alarm.label,
    occurrence: alarm.occurrence,
    time: alarm.time,
    weekdays: alarm.weekdays,
    id: alarm.id,
    tune: alarm.tune,
    fingerprint: fingerprint(),
    modified: Date.now(),
    closeTask: alarm.closeTask
  }
  switch (alarm.occurrence) {
    case AlarmCases.Weekly:
      modAlarm.date =  [0,0,0]
      break
    case AlarmCases.Daily:
      modAlarm.date = [0,0,0]
      modAlarm.weekdays = 127
      break
    default:
      modAlarm.weekdays = 0
      break
  }
  try {
    const client = await getClient()
    const res = await client.request(
      {
        url: `${server}/api/alarm/` + modAlarm.id,
        method: "PUT",
        headers: {
          token: token
        },
        body: Body.json(modAlarm),
        responseType: ResponseType.JSON
      }
    )
    isSuccess(res)
    let oldAlarms = alarms.filter(alarm => alarm.id !== modAlarm.id)
    useAlarms.setState({ alarms: [...oldAlarms, alarm] })
    notification("Edit Alarm", "Alarm modified")
  } catch (err) {
    let oldAlarms = alarms.filter(alarm => alarm.id !== modAlarm.id)
    alarm.offline = true
    useAlarms.setState({ alarms: [...oldAlarms, alarm] })
    notification(
      "Edit Alarm",
      "Alarm edit save failed (offline mode)",
      Status.Error
    )
  }
}

async function postOfflineEdit(alarm: Alarm) {
  const { server, token } = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms
  if (alarm.id.endsWith("OFFLINE")) {
    postOfflineAlarms()
    return
  }
  try {
    const client = await getClient()
    const res = await client.request(
      {
        url: `${server}/api/alarm/` + alarm.id,
        method: "PUT",
        headers: {
          token: token
        },
        body: Body.json(alarm),
        responseType: ResponseType.JSON
      }
    )

    isSuccess(res)
    let newAlarm = { ...alarm }
    newAlarm.offline = false

    useAlarms.setState({ alarms: [...alarms.filter(oldAlarm => oldAlarm.id !== newAlarm.id), newAlarm] })
    notification("Edit Alarm", "Offline edited Alarm updated online")
  } catch (err) {
    notification(
      "Edit Alarm",
      "Offline alarm edit save failed",
      Status.Error
    )
  }
}

export async function postOfflineAlarms() {
  const { server, token } = getCommunicationInfo();
  const alarms = useAlarms.getState().alarms;
  let offlineAlarms = alarms.filter(alarm => alarm.id.endsWith("OFFLINE"));
  for(const alarm of offlineAlarms) {
    let postAlarm: Partial<Alarm> = { ...alarm };
    delete postAlarm.id;
    if(!alarm) {
      return;
    }
    try {
      const client = await getClient();
      const res = await client.request(
        {
          url: `${server}/api/alarm`,
          method: "POST",
          headers: {
            token: token
          },
          body: Body.json(postAlarm),
          responseType: ResponseType.JSON
        }
      );
      interface Data {
        alarm: Alarm;
      }
      isSuccess(res);
      let data = res.data as Alarm;
      let addedAlarm = data.id;
      let alarmWithID = postAlarm as Alarm;
      alarmWithID.id = addedAlarm;
      notification("Alarm", "Offline Alarm inserted to an online database");
      let filteredAlarms = alarms.filter(oldAlarm => oldAlarm.id !== alarm.id);
      useAlarms.setState({ alarms: [...filteredAlarms, alarmWithID] });
    } catch(err: any) {
      notification("Edit Alarm", " Offline Alarm save failed ", Status.Error);
    }
  }
  await sleep(200);
}

function runAlarmSet(id: string | undefined, alarms: Array<Alarm>) {
  if (!id) {
    return undefined
  }
  let f = alarms.filter(alarm => alarm.id === id)[0]
  if (f) {
    return f
  }
  return undefined
}

async function deleteAlarm() {
  const { server, token } = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms
  let id = useAlarms.getState().toDelete

  if (!id) {
    return
  }
  try {
    const client = await getClient()
    const res = await client.request(
      {
        url: `${server}/api/alarm/` + id,
        method: "DELETE",
        headers: {
          token: token
        },
        responseType: ResponseType.JSON
      }
    )


    //console.log(res)
    isSuccess(res)
    let filteredAlarms = alarms.filter(alarmItem => alarmItem.id !== id)

    notification("Delete Alarm", "Alarm removed")
    useAlarms.setState({ alarms: filteredAlarms })
  } catch (err: any) {
    notification("Delete alarm", "Delete alarm failed not supported offline", Status.Error)
    //console.error(err)
  }
}

async function activityChange(id: string) {
  const { server, token } = getCommunicationInfo()
  const alarms = useAlarms.getState().alarms
  let alarmArr = alarms.filter(alarm => alarm.id === id)
  let alarm = alarmArr[0]
  alarm.active = !alarm.active
  alarm.fingerprint = fingerprint()
  alarm.modified = Date.now()
  alarm.offline = false
  try {
    const client = await getClient()
    const res = await client.request(
      {
        url: `${server}/api/alarm/` + alarm.id,
        method: "PUT",
        headers: {
          token: token
        },
        body: Body.json(alarm),
        responseType: ResponseType.JSON
      }
    )
    isSuccess(res)
    notification("Edit Alarm", "Alarm modified")
    let filteredAlarms = alarms.filter(alarmItem => alarmItem.id !== alarm.id)
    useAlarms.setState({ alarms: [...filteredAlarms, alarm] })
  } catch (err: any) {
    console.error(err)
    alarm.offline = true
    let filteredAlarms = alarms.filter(alarmItem => alarmItem.id !== alarm.id)
    useAlarms.setState({ alarms: [...filteredAlarms, alarm] })
    notification("Edit Alarm", "Alarm edit save failed (using offline)", Status.Error)
  }
}
function timeForNext() {
  const runAlarm = useAlarms.getState().runAlarm
  const alarmTimeout = useTimeouts.getState().id
  const setAlarmCounter = useTimeouts.getState().setAlarmCounter
  useTimeouts.getState().clearAlarmCounter()
  let time = (runAlarm && alarmTimeout) ? Math.floor(timeToNextAlarm(runAlarm) / 1000) : -1
  if (!alarmTimeout) {
    setAlarmCounter(setTimeout(() => useAlarms.getState().setTimeForNextLaunch(-1), 5000))
  }
  if (time > 0) {
    let timer = 5000
    if (time < 10) {
      timer = 300
    } else if (time < 60) {
      timer = 1000
    } else if (time < 3600) {
      timer = 2000
    }
    setAlarmCounter(setTimeout(() => useAlarms.getState().setTimeForNextLaunch(time), timer))
  }
}
const useAlarms = create<UseAlarms>()(
    persist(
      (set, get) => (
          {
            alarms: [],
            runAlarm: undefined,
            toDelete: undefined,
            tune: 'rooster',
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
            logo: alarmClock,
            turnOff: false,
            setTurnOff: (bool) => {
              set(
                {
                  turnOff: bool
                }
              )
            },
          }
      ),

      {
          name: 'alarms', 
          storage: createJSONStorage(() => localStorage), 
          partialize: (state) => (
              { 
                alarms: state.alarms,
              }
          ),
      }
    )
)


export default useAlarms
