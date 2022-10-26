import { useEffect, useContext } from "react";
import { AlarmContext } from "../contexts/AlarmContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { timeToNextAlarm } from "./calcAlarmTime";
import { useNavigate } from "react-router-dom";
const AlarmWatcher  = () => {
    const { alarms, setRunAlarm, runAlarm } = useContext(AlarmContext);
    const { currentDevice } = useContext(DeviceContext);
    const navigate = useNavigate();

    useEffect(() => {
        let delTimeOut = JSON.parse(sessionStorage.getItem('timeOutID'));
        if(delTimeOut){
            try {
                clearTimeout(delTimeOut);
            }catch(err){
                console.log(err);
            }
        }
 
        if(runAlarm._id){
            let timed = timeToNextAlarm(runAlarm);
            if(timed > 0){
                
                let timeOutID = setTimeout(() => { navigate('/playalarm/') }, timed);
                sessionStorage.setItem('timeOutID', JSON.stringify(timeOutID));
                console.log("upcoming alarm :", runAlarm);
                console.log('launching in: ', `${Math.ceil(timed/1000)} seconds`, new Date(timed + Date.now()));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    },[runAlarm]);

    useEffect(() => {
        const filterAlarms = () => {
            if(alarms && alarms.length > 0){
                let filteredAlarms = alarms.filter(alarm => alarm.device_ids.indexOf(currentDevice) !== -1 );
                console.log('alarms for this device: ', filteredAlarms);
                let idTimeOutMap = new Map();
                for(const alarm of filteredAlarms){
                    let timed = timeToNextAlarm(alarm);
                    if(timed && (!isNaN(timed)) && (timed !== Infinity) ){
                        idTimeOutMap.set(timed, alarm);
                    }
                }
                let minTime = Math.min(...idTimeOutMap.keys());
                if(minTime && (!isNaN(minTime)) && (minTime !== Infinity) ){
                    let runThis =  idTimeOutMap.get(minTime);
                    //console.log(runThis)
                    setRunAlarm(runThis);
                }
            }
        } 
        filterAlarms();
    },[alarms, currentDevice, setRunAlarm])
};

export default AlarmWatcher;