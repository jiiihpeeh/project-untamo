import React from "react";
import AlarmOnce from "./AlarmOnce";
import AlarmWeekly from "./AlarmWeekly";
import AlarmDaily from "./AlarmDaily";
import AlarmYearly from "./AlarmYearly";

const AlarmSelector = (props) => {    
    return(<>
        {props.alarmCase === 'once' &&
        <AlarmOnce setTime={props.setTime}
                   time={props.time}  
                   setDate={props.setDate} 
                   date={props.date} 
                   selectedDevices={props.selectedDevices} 
                   setSelectedDevices={props.setSelectedDevices} 
                   label={props.label} 
                   setLabel={props.setLabel}
        />}
        {props.alarmCase === 'weekly' &&
        <AlarmWeekly setTime={props.setTime}
                     time={props.time}  
                     weekdays={props.weekdays} 
                     setWeekdays={props.setWeekdays} 
                     selectedDevices={props.selectedDevices} 
                     setSelectedDevices={props.setSelectedDevices} 
                     label={props.label} 
                     setLabel={props.setLabel}
        />}
        {props.alarmCase === 'daily' &&
        <AlarmDaily setTime={props.setTime} 
                    time={props.time}  
                    weekdays={props.weekdays} 
                    setWeekdays={props.setWeekdays} 
                    selectedDevices={props.selectedDevices} 
                    setSelectedDevices={props.setSelectedDevices} 
                    label={props.label} 
                    setLabel={props.setLabel}
        />}
        {props.alarmCase === 'yearly' &&
        <AlarmYearly setTime={props.setTime}
                     time={props.time}  
                     setDate={props.setDate} 
                     date={props.date} 
                     selectedDevices={props.selectedDevices} 
                     setSelectedDevices={props.setSelectedDevices} 
                     label={props.label} 
                     setLabel={props.setLabel}
        />}
    </>)
};

export default AlarmSelector;
