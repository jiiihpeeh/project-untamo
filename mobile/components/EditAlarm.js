import { Fab, Button, Div, Text } from "react-native-magnus";
import React, { useRef, useState, useContext, useEffect } from 'react';
import Icon from "react-native-vector-icons/EvilIcons";
import { DeviceContext } from '../context/DeviceContext';
import { SessionContext } from '../context/SessionContext';
import { AlarmContext } from '../context/AlarmContext';
import axios from 'axios';
import AlarmSelector from "./AlarmComponents/AlarmSelector";
import { numberToWeekDay } from './calcAlarmTime'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseDate } from "./AlarmComponents/parseDate";
import { stringifyDate } from "./AlarmComponents/stringifyDate";
const EditAlarm = (props) => {
    
    const { alarms, setAlarms } = useContext(AlarmContext);
	const { token, server } = useContext(SessionContext);
    const { currentDevice } = useContext(DeviceContext);
    const [ time, setTime ] = useState('00:00');
    const [ date, setDate ] = useState(new Date());
    const [ selectedDevices, setSelectedDevices] = useState();
    const [ weekdays, setWeekdays ] = useState([ ]);
    const [ label, setLabel ] = useState('Alarm');
    const [ alarmCase, setAlarmCase ] = useState('weekly');
    const [showModal, setShowModal ]  = useState(false);
	const [ postAlarm, setPostAlarm ] = useState(false);
    const [cancel, setCancel] = useState(false);
    const [ active, setActive ] = useState(true);
    const [ editAlarm, setEditAlarm ] = useState({})

    useEffect(() => {
        if(cancel){
            setShowModal(false);
            props.setEditID('');
            setCancel(false);
        }
    },[cancel])
   
    useEffect(()=>{
        if(props.editID !== ''){
            console.log('clicked button ', props.editID);
            let alarmToEdit = alarms.filter(alarm => alarm._id === props.editID)[0];
            setEditAlarm(alarmToEdit);
            console.log(alarmToEdit);
            setWeekdays(alarmToEdit.wday);
            setActive(alarmToEdit.active);
            setTime(alarmToEdit.time);
            setAlarmCase(alarmToEdit.occurence);
            setSelectedDevices(alarmToEdit.device_ids);
            setLabel(alarmToEdit.label);
            props.setEditID('');
            setShowModal(true);
        }
        
    },[props.editID])
  
	useEffect(() =>{
		const alarmPost = async () => {
            if(postAlarm){
                console.log("POST...");
    
                if(selectedDevices.length === 0){
                    console.log("no devices")
                    return			
                }
                if(( alarmCase === 'weekly') && (weekdays.length === 0) ){
                    console.log("wrong configuration")
                    return
                }
                console.log("posting")
  
                // try {
                    let modAlarm = {
                        _id:editAlarm._id,
                        active: active,
                        date: stringifyDate(date),
                        device_ids: selectedDevices,
                        label: label,
                        occurence: alarmCase,
                        time: time,
                        wday: weekdays,
                    };
                    console.log('Alarm: ', modAlarm)
                    switch(alarmCase){
                        case 'weekly':
                            modAlarm.date = '';
                            break;
                        case 'daily':
                            modAlarm.date = '';
                            modAlarm.wday = [];
                        break;
                        default:
                            modAlarm.wday = [];
                            break;
                    }
                    console.log("modifying ", editAlarm._id)
					const res = await axios.put(`${server}/api/alarm/${editAlarm._id}`, modAlarm, {headers: {token: token}} );
                    let oldAlarms = alarms.filter(alarm => alarm._id !== modAlarm._id);
                    oldAlarms.push(modAlarm);
                    await AsyncStorage.setItem('alarms', JSON.stringify(oldAlarms));
                    setAlarms(oldAlarms);
					setShowModal(false);
				// } catch (err){
				// 	console.error(err.data);
				// }
				setPostAlarm(false);
			}
		}
		
		alarmPost();
	},[postAlarm])

    return(<>       
            <AlarmSelector  alarmCase={alarmCase}
                setAlarmCase={setAlarmCase}
                time={time}
                setTime={setTime} 
                setDate={setDate} 
                date={date} 
                selectedDevices={selectedDevices} 
                setSelectedDevices={setSelectedDevices} 
                label={label} 
                setLabel={setLabel}
                weekdays={weekdays}
                setWeekdays={setWeekdays}
                showModal={showModal}
                setShowModal={setShowModal}
                postAlarm={postAlarm}
                setPostAlarm={setPostAlarm}
                setCancel={setCancel}
                setEditID={props.setEditID}
                active={active}
                setActive={setActive}
            />
    </>)
}

export default EditAlarm;