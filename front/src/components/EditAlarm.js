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
	Divider,
	Text,
	IconButton
	} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons';
import React, { useRef, useState, useContext, useEffect } from 'react'
import axios from 'axios';
import { notification } from './notification';
import { AlarmContext } from '../contexts/AlarmContext';
import AlarmSelector from './AlarmComponents/AlarmSelector';

function EditAlarm(props) {
	const btnRef = useRef();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [ time, setTime ] = useState(props.valinta.time);
    const [date, setDate] = useState(props.valinta.date);
    const [selectedDevices, setSelectedDevices] = useState(props.valinta.device_ids);
    const [weekdays, setWeekdays] = useState(props.valinta.wday);
    const [ label, setLabel ] = useState(props.valinta.label);
    const [alarmCase] = useState(props.valinta.occurence);
	const { setAlarms } = useContext(AlarmContext);

	useEffect(() => {
        console.log(time)
        console.log(date)
        console.log(selectedDevices)
        console.log(weekdays)
        console.log(label)
        console.log(alarmCase)
    },[time,date, selectedDevices, weekdays, label, alarmCase])

	const onRegister = async () => {
		try {
		let ModAlarm = {
			active: 1,
			date: date,
			device_ids: selectedDevices,
			label: label,
			occurence: alarmCase,
			time: time,
			wday: weekdays,
			_id: props.valinta._id
		}
		console.log("Try: /api/alarm/"+ModAlarm._id,ModAlarm)
		const res = await axios.put('/api/alarm/'+ModAlarm._id,ModAlarm );
		console.log(res.data);
		notification("Edit Alarm", "Alarm succesfully modified")
		var oldAlarms=JSON.parse(localStorage.getItem('alarms')) || [];
		for (let i = 0; i < oldAlarms.length; i++) {
			if(oldAlarms[i]._id===ModAlarm._id) {
				oldAlarms.splice(i,1)
				props.updateAlarms(oldAlarms)
			}
		}
		oldAlarms.push(ModAlarm)
		localStorage.setItem('alarms', JSON.stringify(oldAlarms))
		setAlarms(oldAlarms);
	} catch (err){
		console.error(err)
		notification("Edit Alarm", "Alarm edit save failed", "error")
	}
		onClose()
	}
let idRow=<><FormLabel>ID: {props.valinta._id}</FormLabel></>
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
			<DrawerBody>
			<Divider m={'5px'}/>
			<Center>
				<Text color='gray'>{idRow}</Text>
			</Center>
			<Divider m={'5px'}/>
			<AlarmSelector alarmCase={alarmCase}
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
				<Button variant='outline' mr={3} onClick={onClose} colorScheme="red">Cancel</Button>
				<Button colorScheme='green' onClick={onRegister}>Save</Button>
			</DrawerFooter>
			</DrawerContent>
			</Drawer>
		</>
		)
	}

export default EditAlarm;