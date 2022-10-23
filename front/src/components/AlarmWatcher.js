import { useEffect, useContext } from "react";
import { AlarmContext } from "../contexts/AlarmContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { timeToNextAlarm } from "./calcAlarmTime";
import { useNavigate } from "react-router-dom";
const AlarmWatcher  = () => {
    const { alarms, setRunAlarm } = useContext(AlarmContext);
    const { currentDevice } = useContext(DeviceContext);
    const navigate = useNavigate();
    useEffect(() => {

        const goToAlarm = () => {
            navigate('/playalarm/');
        }

        const filterAlarms = () => {
            if(alarms && alarms.length > 0){
                // if(timeOutIDs.length > 0){
                //     clearTimeOuts();
                // }
                
                let filteredAlarms = alarms.filter(alarm => alarm.device_ids.indexOf(currentDevice) !== -1 );
                console.log('alarms for this device: ', filteredAlarms);
                let idTimeOutMap = new Map();
                for(const alarm of filteredAlarms){
                    let timed = timeToNextAlarm(alarm);
                    idTimeOutMap.set(timed, alarm.id);
                }
                let minTime = Math.min(...idTimeOutMap.keys());
                if(minTime && (!isNaN(minTime)) && (minTime !== Infinity) ){
                    console.log('launching in', minTime)
                    let minID =  idTimeOutMap[minTime];
                    setRunAlarm(minID);
                    let timeOutID = setTimeout(goToAlarm, minTime);
                    //setTimeOutIDs([...timeOutIDs, timeOutID]);
                }
            }
        } 
        filterAlarms();
    },[alarms, currentDevice, setRunAlarm, navigate])
};

export default AlarmWatcher;