import {
	useDisclosure,
	Link,
	Button,
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	FormLabel,
	Center,
	Tooltip,
	Text,
	IconButton
	} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons';
import React, { useRef, useState, useContext } from 'react'
import axios from 'axios';
import { notification } from './notification';
import { AlarmContext } from '../contexts/AlarmContext';
import AlarmSelector from './AlarmComponents/AlarmSelector';
import { parseDate } from './AlarmComponents/parseDate';
import { stringifyDate } from './AlarmComponents/stringifyDate';
import { SessionContext } from '../contexts/SessionContext';


function EditAlarm(props) {
	const btnRef = useRef();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [ time, setTime ] = useState(props.valinta.time);
	const [date, setDate] = useState(parseDate(props.valinta.date));
	const [selectedDevices, setSelectedDevices] = useState(props.valinta.device_ids);
	const [weekdays, setWeekdays] = useState(props.valinta.wday);
	const [ label, setLabel ] = useState(props.valinta.label);
	const [alarmCase, setAlarmCase] = useState(props.valinta.occurence);
	const { alarms, setAlarms } = useContext(AlarmContext);
	const { token } = useContext(SessionContext);

	// useEffect(() => {
    //     console.log(time)
    //     console.log(date)
    //     console.log(selectedDevices)
    //     console.log(weekdays)
    //     console.log(label)
    //     console.log(alarmCase)
    // },[time,date, selectedDevices, weekdays, label, alarmCase])
	const clearStates = () => {
		setDate(new Date());
		setSelectedDevices([]);
		setWeekdays ([]);
		setLabel('Alarm');
		setAlarmCase('weekly');
	}
	const onEdit = async () => {
		try {
			let modAlarm = {
				active: true,
				date: stringifyDate(date),
				device_ids: selectedDevices,
				label: label,
				occurence: alarmCase,
				time: time,
				wday: weekdays,
				_id: props.valinta._id
			};
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
			console.log("Try: /api/alarm/"+modAlarm._id,modAlarm);
			const res = await axios.put('/api/alarm/'+modAlarm._id, modAlarm,  {
				headers: {'token': token}
			});
			console.log(res.data);
			notification("Edit Alarm", "Alarm modified");
			let oldAlarms = alarms.filter(alarm => alarm._id !== modAlarm._id);
			oldAlarms.push(modAlarm);
			localStorage.setItem('alarms', JSON.stringify(oldAlarms));
			setAlarms(oldAlarms);
			//const [ time, setTime ] = useState(props.valinta.time);
		} catch (err){
			console.error(err);
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
			<Tooltip label='Edit alarm' fontSize='md'>
            <IconButton size='xs' icon={<EditIcon/>} ml="5.5%"/>
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
			<DrawerHeader>Edit Alarm</DrawerHeader>	
				<Center>
				<Text color='gray'>{<FormLabel>ID: {props.valinta._id}</FormLabel>}</Text>
			</Center>
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
				<Button colorScheme='green' onClick={onEdit}>Save</Button>
			</DrawerFooter>
			</DrawerContent>
			</Drawer>
		</>
	)
};

export default EditAlarm;

    