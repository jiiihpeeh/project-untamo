import React from "react";
import AlarmOnce from "./AlarmOnce";
import AlarmWeekly from "./AlarmWeekly";
import AlarmDaily from "./AlarmDaily";
import AlarmYearly from "./AlarmYearly";
import AlarmCase from "./AlarmCase";
import { Divider } from "@chakra-ui/react";
import { AlarmComponentsContext } from "./AlarmComponentsContext";


const AlarmSelector = (props) => {
    const alarmCase = props.alarmCase;
    const setAlarmCase = props.setAlarmCase;
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
    	<AlarmComponentsContext.Provider value={{ alarmCase, setAlarmCase, time, setTime, date, setDate, selectedDevices, setSelectedDevices, label, setLabel, weekdays, setWeekdays}}>
            <AlarmCase/>
            <Divider m={'5px'}/>
            {alarmCase === 'once' &&
            <AlarmOnce />}
            {alarmCase === 'weekly' &&
            <AlarmWeekly  />}
            {alarmCase === 'daily' &&
            <AlarmDaily />}
            {alarmCase === 'yearly' &&
            <AlarmYearly  />}
        </AlarmComponentsContext.Provider>
    </>)
};

export default AlarmSelector;
