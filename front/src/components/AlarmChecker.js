import { useEffect } from "react";
import { useState, useContext } from "react";
import { AlarmContext } from "../contexts/AlarmContext";
import { DeviceContext } from "../contexts/DeviceContext";
const AlarmChecker  = () => {
    const { alarms } = useContext(AlarmContext);
    const { currentDevice } = useContext(DeviceContext);
    useEffect(() => {
        const filterAlarms = () => {
            let filteredAlarms = alarms.filter(alarm => alarm.device_ids.indexOf(currentDevice) !== -1 );
            console.log('alarms for this device: ', filteredAlarms);
        } 
        filterAlarms()
    },[alarms, currentDevice])
};

export default AlarmChecker;