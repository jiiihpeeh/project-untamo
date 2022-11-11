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
import { stringifyDate } from './AlarmComponents/stringifyDate'

const AddAlarm = () => {	
    const { alarms, setAlarms } = useContext(AlarmContext);
	const { token, server } = useContext(SessionContext);
    const { currentDevice } = useContext(DeviceContext);
    const [ time, setTime ] = useState('00:00');
    const [ date, setDate ] = useState(new Date());
    const [ selectedDevices, setSelectedDevices] = useState([currentDevice]);
    const [ weekdays, setWeekdays ] = useState([ numberToWeekDay(new Date().getDay()) ]);
    const [ label, setLabel ] = useState('Alarm');
    const [ alarmCase, setAlarmCase ] = useState('weekly');
    const [ showModal, setShowModal ]  = useState(false);
	const [ postAlarm, setPostAlarm ] = useState(false);
	const [ cancel, setCancel] = useState(false);
	const [ active, setActive ] = useState(true);

    useEffect(() => {
        if(cancel){
            setShowModal(false);
            setCancel(false);
        }
    },[cancel])
    const showDialog = (alarmType) => {
        setShowModal(true);
		setDate(new Date());
		setSelectedDevices([currentDevice]);
		setWeekdays([ numberToWeekDay(new Date().getDay())]);
        setAlarmCase(alarmType);
    }
	
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

				try {
					let newAlarm = {
						active: active,
						date: stringifyDate(date),
						device_ids: selectedDevices,
						label: label,
						occurence: alarmCase,
						time: time,
						wday: weekdays,
					};
					switch(alarmCase){
						case 'weekly':
							newAlarm.date = '';
							break;
						case 'daily':
							newAlarm.date = '';
							newAlarm.wday = [];
						break;
						default:
							newAlarm.wday = [];
							break;
					}
					console.log("Posting alarm:", newAlarm);
					const res = await axios.post(`${server}/api/alarm/`, newAlarm, {headers: {token: token}} );
					//console.log(res.data);
					let addedAlarm = res.data.alarm;
					let currentAlarms = [...alarms, addedAlarm];
					await AsyncStorage.setItem('alarms', JSON.stringify(currentAlarms));
					setAlarms(currentAlarms);
					setShowModal(false);
				} catch (err){
					console.error(err.data);
				}
				setPostAlarm(false);
			}
		}
		
		alarmPost();
	},[postAlarm])
    return(<>
        <Fab bg="blue600" h={65} w={65}>
            <Button p="none" 
                    bg="transparent" 
                    justifyContent="flex-end" 
                    mb={20}  
                    onPress={() => showDialog('once')}>
                <Div rounded="sm" bg="white" p="sm">
                    <Text fontSize="xl">Once</Text>
                </Div>
                <Icon
                    name="clock"
                    color="blue600"
                    h={100}
                    w={100}
                    rounded="circle"
                    ml="md"
                    bg="white"
                />
            </Button>
            <Button p="none" 
                    bg="transparent" 
                    justifyContent="flex-end" 
                    mb={20}
                    onPress={() => showDialog('weekly')}>
                <Div rounded="sm" bg="white" p="sm">
                    <Text fontSize="xl">Weekly</Text>
                </Div>
                <Icon
                    name="clock"
                    color="blue600"
                    h={100}
                    w={100}
                    rounded="circle"
                    ml="md"
                    bg="white"
                />
            </Button>
            <Button p="none" 
                    bg="transparent" 
                    justifyContent="flex-end" 
                    mb={20}
                    onPress={() => showDialog('daily')}>
                <Div rounded="sm" bg="white" p="sm">
                    <Text fontSize="xl">Daily</Text>
                </Div>
                <Icon
                    name="clock"
                    color="blue600"
                    h={100}
                    w={100}
                    rounded="circle"
                    ml="md"
                    bg="white"
                />
            </Button>
            <Button p="none" 
                    bg="transparent" 
                    justifyContent="flex-end" 
                    mb={20}
                    onPress={() => showDialog('yearly')}>
                <Div rounded="sm" bg="white" p="sm">
                    <Text fontSize="xl">Yearly</Text>
                </Div>
                <Icon
                    name="clock"
                    color="blue600"
                    h={100}
                    w={100}
                    rounded="circle"
                    ml="md"
                    bg="white"
                />
            </Button>
        </Fab>
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
						active={active}
						setActive={setActive}
                    />
        </>
    )
}

export default AddAlarm;