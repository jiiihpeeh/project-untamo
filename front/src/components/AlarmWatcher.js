import { useEffect, useContext, useState,useRef } from "react";
import { AlarmContext } from "../contexts/AlarmContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { timeToNextAlarm } from "./calcAlarmTime";
import { useNavigate } from "react-router-dom";
const AlarmWatcher  = () => {
    const { alarms, setRunAlarm, runAlarm } = useContext(AlarmContext);
    const { currentDevice } = useContext(DeviceContext);
    const navigate = useNavigate();



    useEffect(() => {
        let delTimeOut = JSON.parse(sessionStorage.getItem('timeOutID'))
        if(delTimeOut){
            try {
                clearTimeout(delTimeOut);
            }catch(err){
                console.log(err)
            }
        }
        if(runAlarm.id){
            let timed = timeToNextAlarm(runAlarm);
            if(timed > 0){
                let timeOutID = setTimeout(() => { navigate('/playalarm/') }, timed);
                sessionStorage.setItem('timeOutID', JSON.stringify(timeOutID))
                console.log("upcoming alarm ", runAlarm);
            }
        }

    },[runAlarm]);

    useEffect(() => {
        const filterAlarms = () => {
            if(alarms && alarms.length > 0){
                let filteredAlarms = alarms.filter(alarm => alarm.device_ids.indexOf(currentDevice) !== -1 );
                console.log('alarms for this device: ', filteredAlarms);
                let idTimeOutMap = new Map();
                for(const alarm of filteredAlarms){
                    let timed = timeToNextAlarm(alarm);
                    idTimeOutMap.set(timed, alarm);
                }
                let minTime = Math.min(...idTimeOutMap.keys());
                if(minTime && (!isNaN(minTime)) && (minTime !== Infinity) ){
                    console.log('launching in: ', minTime);
                    let runThis =  idTimeOutMap.get(minTime);
                   
                    
                    setRunAlarm(runThis);
                }
            }
        } 
        filterAlarms();
    },[alarms, currentDevice, setRunAlarm])
};

export default AlarmWatcher;