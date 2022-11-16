import React, { useEffect, useContext } from "react";
import { AlarmContext } from "../context/AlarmContext";
import { DeviceContext } from "../context/DeviceContext";
import { timeToNextAlarm } from "./calcAlarmTime";
import AsyncStorage from "@react-native-async-storage/async-storage";

const clearAlarmTimeout = async () => {
    let delTimeOut = JSON.parse(await AsyncStorage.getItem('timeOutID'));
        if(delTimeOut){
            try {
                clearTimeout(delTimeOut);
            }catch(err){
                console.log(err);
        };
    };
}


const AlarmWatcher  = () => {
    const { alarms, setRunAlarm, runAlarm, alarmWindow, setAlarmWindow } = useContext(AlarmContext);
    const { currentDevice } = useContext(DeviceContext);

    useEffect(() => {
        const filterAlarms = async () => {
            if(runAlarm){
                if((runAlarm.hasOwnProperty('active') && (runAlarm.active === false) ) ||
                  (runAlarm.hasOwnProperty('device_ids') && (!runAlarm.device_ids.includes(currentDevice))) ){
                    setRunAlarm('');
                };
            };
            if(alarmWindow) {
                let currentRunArr = alarms.filter(alarm => alarm._id === runAlarm);
                if ((currentRunArr.length === 1) && currentRunArr[0].hasOwnProperty('snooze')){
                    let timeNow = new Date().getTime();
                    let diff = timeNow - Math.max(...currentRunArr[0].snooze) ;
                    if(diff < 60000 || currentRunArr[0].snooze[0] === 0){
                        setAlarmWindow(false);
                    };
                };
            };
            if(alarms && currentDevice && alarms.length > 0){
                let filteredAlarms = alarms.filter(alarm => alarm.device_ids.indexOf(currentDevice) !== -1 );
                filteredAlarms = filteredAlarms.filter(alarm => alarm.active === true);
                //console.log('active alarms for this device: ', filteredAlarms);
                let idTimeOutMap = new Map();
                for(const alarm of filteredAlarms){
                    let timed = timeToNextAlarm(alarm);
                    if(timed && (!isNaN(timed)) && (Math.abs(timed) !== Infinity) ){
                        idTimeOutMap.set(timed, alarm._id);
                    };
                };
                console.log(idTimeOutMap)
                let minTime = Math.min(...idTimeOutMap.keys());
                if(minTime && (!isNaN(minTime)) && (Math.abs(minTime) !== Infinity) ){
                    let runThis =  idTimeOutMap.get(minTime);
                    //console.log(runThis)
                    let timed = timeToNextAlarm(alarms.filter(alarm => alarm._id === runThis)[0]);
                    //console.log(timed)
                    if(timed > 100){
                        clearAlarmTimeout();
                        setRunAlarm(runThis);
                        let timeOutID = setTimeout(() => { setAlarmWindow(true) }, timed);
                        await AsyncStorage.setItem('timeOutID', JSON.stringify(timeOutID));
                        console.log("upcoming alarm :", runThis);
                        let alarmDate =   new Date(timed + Date.now())
                        console.log('launching in: ', `${Math.ceil(timed/1000)} seconds`, alarmDate);
                    //notification("Alarm", `Time for the next alarm is ${alarmDate}`, "info", timed, 'alarm-notifier-toast')
                     };  
                    //setRunAlarm(runThis);
                };
            };
        };
        //clearAlarmTimeout();
        filterAlarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    },[alarms, currentDevice, setRunAlarm])
};

export default AlarmWatcher;