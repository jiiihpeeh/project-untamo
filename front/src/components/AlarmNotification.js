import { timeForNextAlarm, timeToNextAlarm } from "./calcAlarmTime";
import React,{useContext, useEffect } from "react";
import { AlarmContext } from "../contexts/AlarmContext";
import { SessionContext } from "../contexts/SessionContext";
import { useToast } from "@chakra-ui/react";

const AlarmNotification = ()  => {
	const {runAlarm} = useContext(AlarmContext);
	let message = timeForNextAlarm(runAlarm);
	let duration = timeToNextAlarm(runAlarm);
    const {sessionStatus} = useContext(SessionContext);
	//console.log('DURATION ', duration)
	const toast = useToast()

	const  AddToast = () => {
	    return ( !toast.isActive('alarm-notification') && toast({
		title: `${runAlarm.label}`,
		description: `${message}`,
		status: 'info',
		isClosable: false,
		duration: duration,
		id:'alarm-notification'
	  })
		)
	}
	useEffect(() => {
		const  updateToast = () => {
			toast.update('alarm-notification', { 
                                                title: `${runAlarm.label}`, 
												description: `${timeForNextAlarm(runAlarm)}`,
												duration : timeToNextAlarm(runAlarm) 
												}
            );
	  	}
	  	updateToast();
	},[runAlarm]);
    useEffect(() =>{
        const closeToast = () => {
            toast.close('alarm-notification');
        }
        if(!sessionStatus || !runAlarm.hasOwnProperty('_id') ){
            closeToast();
        }
    },[sessionStatus]);

	return (<>
		      <AddToast/>
		   </>
	)
  }
  export default AlarmNotification;