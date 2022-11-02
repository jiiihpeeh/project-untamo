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
        if(!toast.isActive('alarm-notification')){
            return (toast({
                title: `${runAlarm.label}`,
                description: `${message}`,
                status: 'info',
                duration: duration,
                id:'alarm-notification',
                isClosable: true,
            })
        )}
    }
	useEffect(() => {
		const  updateToast = () => {
			if(!runAlarm.hasOwnProperty('_id')){
				return;
			}
			toast.update('alarm-notification', { 
                                                title: `${runAlarm.label}`, 
												description: `${timeForNextAlarm(runAlarm)}`,
												duration : timeToNextAlarm(runAlarm),
                                                isClosable: true,
												}
            );
	  	}
	  	updateToast();
	},[runAlarm]);
    useEffect(() =>{
        const closeToast = () => {
            toast.close('alarm-notification');
        }
        if(!sessionStatus || (!runAlarm.hasOwnProperty('_id')) ){
            closeToast();
        }
    },[sessionStatus, runAlarm]);

	return (<>
		      <AddToast/>
		   </>
	)
  }
  export default AlarmNotification;