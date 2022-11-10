import { Fab, Button, Div, Text } from "react-native-magnus";
import React, { useRef, useState, useContext, useEffect } from 'react';
import Icon from "react-native-vector-icons/EvilIcons";
import { DeviceContext } from '../context/DeviceContext';
import { SessionContext } from '../context/SessionContext';
import { AlarmContext } from '../context/AlarmContext';
import axios from 'axios';
import AlarmSelector from "./AlarmComponents/AlarmSelector";
import { numberToWeekDay } from './calcAlarmTime'
/* 

import { timePadding } from './AlarmComponents/timePadding';
import React, { useRef, useState, useContext } from 'react';

import AlarmSelector from './AlarmComponents/AlarmSelector';
import { stringifyDate } from './AlarmComponents/stringifyDate';



const alarmTime = () => {
	let date = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
	return `${timePadding(date.getHours())}:${timePadding(date.getMinutes())}`;
};

function AddAlarm() {
	const btnRef = useRef();
	
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [ time, setTime ] = useState(alarmTime());
    const [ date, setDate ] = useState(new Date());
    const [ selectedDevices, setSelectedDevices] = useState([currentDevice]);
    const [ weekdays, setWeekdays ] = useState([new Date().toLocaleDateString('en-US', {weekday: 'long'})]);
    const [ label, setLabel ] = useState('Alarm');
    const [ alarmCase, setAlarmCase ] = useState('weekly');
	const { alarms, setAlarms } = useContext(AlarmContext);
	const { token, server } = useContext(SessionContext);
    const {currentDevice} = useContext(DeviceContext);

	const clearStates = () => {
		setDate(new Date());
		setSelectedDevices([currentDevice]);
		setWeekdays ([new Date().toLocaleDateString('en-US', {weekday: 'long'})]);
		setLabel('Alarm');
		setAlarmCase('weekly');
	}
	const onAdd = async (event) => {
		event.currentTarget.disabled = true;
		if(selectedDevices.length === 0){
			notification("Add alarm", "No devices set", "error")
			return			
		}
		if(( alarmCase === 'weekly') && (weekdays.length === 0) ){
			notification("Add alarm", "No weekdays set", "error")
			return
		}
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
			const res = await axios.post(`${server}/api/alarm/`, newAlarm, {headers: {token: token}} );
			//console.log(res.data);
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
	const onDrawerOpen = () => {
		setTime(alarmTime());
		setDate(new Date());
		onOpen();
	}
//let idRow=<><FormLabel>ID: {props.valinta._id}</FormLabel></>
	return (
		<>
		<Link onClick={onDrawerOpen}>
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

 */
const AddAlarm = () => {	
    const { alarms, setAlarms } = useContext(AlarmContext);
	const { token, server } = useContext(SessionContext);
    const {currentDevice} = useContext(DeviceContext);
    const [ time, setTime ] = useState('00:00');
    const [ date, setDate ] = useState(new Date());
    const [ selectedDevices, setSelectedDevices] = useState([currentDevice]);
    const [ weekdays, setWeekdays ] = useState([ numberToWeekDay(new Date().getDay()) ]);
    const [ label, setLabel ] = useState('Alarm');
    const [ alarmCase, setAlarmCase ] = useState('weekly');
    const [showModal, setShowModal ]  = useState(false);
    const showDialog = (alarmType) => {
        setShowModal(true);
		setWeekdays([ numberToWeekDay(new Date().getDay())]);
        setAlarmCase(alarmType);
    }

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
                        />
        </>
    )
}

export default AddAlarm;