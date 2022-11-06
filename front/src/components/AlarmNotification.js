import { timeForNextAlarm, timeToNextAlarm } from "./calcAlarmTime";
import React,{useContext, useEffect, useState } from "react";
import { AlarmContext } from "../contexts/AlarmContext";
import { SessionContext } from "../contexts/SessionContext";
import { useToast } from "@chakra-ui/react";

const AlarmNotification = ()  => {
    const [ alarm, setAlarm] = useState(undefined)
	const {runAlarm, alarms } = useContext(AlarmContext);
    const {sessionStatus} = useContext(SessionContext);
	const toast = useToast()

	const  AddToast = () => {
        if(!toast.isActive('alarm-notification') && alarm){
            return (toast({
                title: `${alarm.label}`,
                description: `${alarm.label}`,
                status: 'info',
                duration: timeToNextAlarm(alarm),
                id:'alarm-notification',
                isClosable: true,
            })
        )}
    }
	useEffect(() => {
		const  updateToast = () => {
			if(alarm){
                    toast.update('alarm-notification', { 
                                        title: `${alarm.label}`, 
                                        description: `${timeForNextAlarm(alarm)}`,
                                        duration : timeToNextAlarm(alarm),
                                        isClosable: true,
                                        status: 'info',
                                        id:'alarm-notification',
                                        }
                 );
	  	    };
        };
	  	updateToast();
    },[alarm]);

    useEffect(() => {
     const alarmSet = () => {
        let alarmItem = alarms.filter(alarm => alarm._id === runAlarm)[0];
        if(alarmItem){
            setAlarm(alarmItem);
        }else{
            setAlarm(undefined);
        }
     }
     alarmSet();
	},[runAlarm]);
    useEffect(() =>{
        const closeToast = () => {
            toast.close('alarm-notification');
        }
        if(!sessionStatus || !alarm ){
            closeToast();
        }
    },[sessionStatus, alarm]);

	return (<>
		      <AddToast/>
		   </>
	)
  }
  export default AlarmNotification;