import { useEffect, useContext, useState } from "react";
import { AlarmContext } from "../contexts/AlarmContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { timeToNextAlarm } from "./calcAlarmTime";
import { useNavigate } from "react-router-dom";
const AlarmWatcher  = () => {
    const [ alarmIDTimeout, setAlarmIDTimeout ] = useState(undefined);
    const { alarms, setRunAlarm } = useContext(AlarmContext);
    const { currentDevice } = useContext(DeviceContext);
    const navigate = useNavigate();
    useEffect(() => {

        const goToAlarm = () => {
            navigate('/playalarm/');
        }

        const filterAlarms = () => {
            if(alarms && alarms.length > 0){
                if(alarmIDTimeout){
                    try{
                        clearTimeout(alarmIDTimeout);
                    } catch(err) {};
                }
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
                    console.log("upcoming alarm ", runThis)
                    setRunAlarm(runThis);
                    let timeOutID = setTimeout(goToAlarm, minTime);
                    setAlarmIDTimeout(timeOutID);
                }
            }
        } 
        filterAlarms();
    },[alarms, currentDevice])
};

export default AlarmWatcher;