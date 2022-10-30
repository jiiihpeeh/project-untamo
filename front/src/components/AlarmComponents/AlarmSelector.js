import React from "react";
import AlarmOnce from "./AlarmOnce";
import AlarmWeekly from "./AlarmWeekly";
import AlarmDaily from "./AlarmDaily";
import AlarmYearly from "./AlarmYearly";
import { AlarmComponentsContext } from "./AlarmComponentsContext";


const AlarmSelector = (props) => {
    const setTime= props.setTime;
    const time= props.time;
    const setDate= props.setDate;
    const date= props.date;
    const selectedDevices= props.selectedDevices;
    const setSelectedDevices= props.setSelectedDevices;
    const label = props.label;
    const setLabel= props.setLabel;
    const weekdays =  props.weekdays;
    const setWeekdays = props.setWeekdays;
    return(<>
    	<AlarmComponentsContext.Provider value={{ time, setTime, date, setDate, selectedDevices, setSelectedDevices, label, setLabel, weekdays, setWeekdays}}>
        {props.alarmCase === 'once' &&
        <AlarmOnce />}
        {props.alarmCase === 'weekly' &&
        <AlarmWeekly  />}
        {props.alarmCase === 'daily' &&
        <AlarmDaily />}
        {props.alarmCase === 'yearly' &&
        <AlarmYearly  />}
    </AlarmComponentsContext.Provider>
    </>)
};

export default AlarmSelector;
