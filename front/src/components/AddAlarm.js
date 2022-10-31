import {
	useDisclosure,
	Button,
	Drawer, DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,Link,
	Tooltip, IconButton 
	} from '@chakra-ui/react';
import { notification } from './notification';
import { AlarmContext } from '../contexts/AlarmContext';
import { timePadding } from './AlarmComponents/timePadding';
import { EditIcon } from '@chakra-ui/icons';
import React, { useRef, useState, useContext } from 'react';
import axios from 'axios';
import AlarmSelector from './AlarmComponents/AlarmSelector';
import { stringifyDate } from './AlarmComponents/stringifyDate';
import { SessionContext } from '../contexts/SessionContext';
import { DeviceContext } from '../contexts/DeviceContext';

const currentTime = () => {
	return `${timePadding(new Date().getHours())}:${timePadding(new Date().getMinutes())}`;
};

function AddAlarm() {
	const btnRef = useRef();
	const {currentDevice} = useContext(DeviceContext);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [ time, setTime ] = useState(currentTime());
    const [ date, setDate ] = useState(new Date());
    const [ selectedDevices, setSelectedDevices] = useState([currentDevice]);
    const [ weekdays, setWeekdays ] = useState([new Date().toLocaleDateString('en-US', {weekday: 'long'})]);
    const [ label, setLabel ] = useState('Alarm');
    const [ alarmCase, setAlarmCase ] = useState('weekly');
	const { alarms, setAlarms } = useContext(AlarmContext);
	const { token } = useContext(SessionContext);

	const clearStates = () => {
		setDate(new Date());
		setSelectedDevices([currentDevice]);
		setWeekdays ([new Date().toLocaleDateString('en-US', {weekday: 'long'})]);
		setLabel('Alarm');
		setAlarmCase('weekly');
	}
	const onAdd = async () => {
		try {
			let newAlarm = {
				active: true,
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
			//console.log("Try: /api/alarm/"+modAlarm._id,modAlarm);
			const res = await axios.post('http://localhost:3001/api/alarm/', newAlarm, {headers: {token: token}} );
			console.log(res.data);
			let addedAlarm = res.data.alarm;
			notification("Edit Alarm", "Alarm modified");
			let currentAlarms = [...alarms, addedAlarm];
			localStorage.setItem('alarms', JSON.stringify(currentAlarms));
			setAlarms(currentAlarms);
			//const [ time, setTime ] = useState(props.valinta.time);
		} catch (err){
			console.error(err.data);
			notification("Edit Alarm", "Alarm edit save failed", "error");
		}
		clearStates();
		onClose();
	}
	const onDrawerClose = () => {
		clearStates();
		onClose();
	}
//let idRow=<><FormLabel>ID: {props.valinta._id}</FormLabel></>
	return (
		<>
		<Link onClick={onOpen}>
			<Tooltip label='Add an alarm' fontSize='md'>
            	<Button size='xl' ml="5.5%" borderRadius={"50%"} backgroundColor={'teal'} width={"50px"} height={"50px"}>+</Button>
			</Tooltip>
		</Link>
		<Drawer
			isOpen={isOpen}
			placement='left'
			onClose={onClose}
			finalFocusRef={btnRef}
			size={'md'}
		>
		<DrawerOverlay />
		<DrawerContent>
			<DrawerCloseButton />
			<DrawerHeader>Add an an alarm</DrawerHeader>	
			<DrawerBody>
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
				/>
			</DrawerBody>
			<DrawerFooter>
				<Button variant='outline' mr={3} onClick={onDrawerClose} colorScheme="red">Cancel</Button>
				<Button colorScheme='green' onClick={onAdd}>Save</Button>
			</DrawerFooter>
			</DrawerContent>
			</Drawer>
		</>
	)
};

export default AddAlarm;