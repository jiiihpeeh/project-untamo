import {
	useDisclosure,
	Text,
	Link,
	Button,
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	FormControl,
	FormLabel,
	Select,
	Input
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useContext } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import { notification } from './notification';
var selType=''

function AddAlarm() {
		const [NewAlarm, setNewAlarm] = useState({
		occurence: 'Select Occurence',
		time: '12:00',
		wday: 0,
		date: '2022-12-24',
		label: 'NewAlarm',
		devices: 0
	});

	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()

//	
	const onChange = (event) => {
		if(event.target.name=='occurence'){	
			selType=event.target.value
		}
		console.log("Form: "+event.target.name+":"+event.target.value)
			
		setNewAlarm((NewAlarm) => {
			return {
				...NewAlarm,
				[event.target.name] : event.target.value
			};
		
		})
	}
	
	const onRegister = async (event) => {
		try {
			console.log("Try: /api/addAlarm/"+localStorage.getItem('user'),NewAlarm)
			
			const res = await axios.put('/api/addAlarm/'+localStorage.getItem('user'),NewAlarm );
			console.log(res.data);
			notification("Add Alarm", "Alarm succesfully added")
		} catch (err){
			console.error(err)
			notification("Add Alarm", "Alarm save failed", "error")
			
		}
	}
if(typeof time_row !== 'undefined'){

// maailmankaikkeudesta voi löytyä järkevämpikin tapa tehdä allaoleva :E
// alla oleva esittää konditionaalista renderöintiä sen mukaan mikä occurence alarmille valittu
if(selType){
	}
	if(selType=='once'){
		document.getElementById('time_row').hidden=false
		document.getElementById('timerow').hidden=false
		document.getElementById('wday_row').hidden=true
		document.getElementById('date_row').hidden=false
		document.getElementById('label_row').hidden=false
		document.getElementById('devices_row').hidden=false
		document.getElementById('wdayrow').hidden=true
		document.getElementById('daterow').hidden=false
		document.getElementById('labelrow').hidden=false
		document.getElementById('devicesrow').hidden=false
		
	} 
	if(selType=='daily'){
		document.getElementById('time_row').hidden=false
		document.getElementById('wday_row').hidden=true
		document.getElementById('date_row').hidden=true
		document.getElementById('label_row').hidden=false
		document.getElementById('devices_row').hidden=false
		document.getElementById('timerow').hidden=false
		document.getElementById('wdayrow').hidden=true
		document.getElementById('daterow').hidden=true
		document.getElementById('labelrow').hidden=false
		document.getElementById('devicesrow').hidden=false
	} 
	if(selType=='weekly'){
		document.getElementById('time_row').hidden=false
		document.getElementById('wday_row').hidden=false
		document.getElementById('date_row').hidden=true
		document.getElementById('label_row').hidden=false
		document.getElementById('devices_row').hidden=false
		document.getElementById('timerow').hidden=false
		document.getElementById('wdayrow').hidden=false
		document.getElementById('daterow').hidden=true
		document.getElementById('labelrow').hidden=false
		document.getElementById('devicesrow').hidden=false
	} 
	if(selType=='yearly'){
		document.getElementById('time_row').hidden=false
		document.getElementById('wday_row').hidden=true
		document.getElementById('date_row').hidden=false
		document.getElementById('label_row').hidden=false
		document.getElementById('devices_row').hidden=false
		document.getElementById('timerow').hidden=false
		document.getElementById('wdayrow').hidden=true
		document.getElementById('daterow').hidden=false
		document.getElementById('labelrow').hidden=false
		document.getElementById('devicesrow').hidden=false
	} 
}
	return (
		<>
		<Link onClick={onOpen}><Text as='b'>
		Add Alarm
		</Text></Link>
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
			<DrawerHeader>Add Alarm</DrawerHeader>
			<DrawerBody>
			<form 
				id='add-alarm-form'
				onSubmit={onRegister}
            >
			<FormControl>
				<FormLabel htmlFor="occu_row">Occurence</FormLabel>
				<Select name="occurence" onChange={onChange}>
					<option value={NewAlarm.occurence}>{NewAlarm.occurence}</option>
					<option value="once">once</option>
					<option value="daily">daily</option>
					<option value="weekly">weekly</option>
					<option value="yearly">yearly</option>
				</Select>
				<FormLabel hidden  id='time_row' htmlFor="time_row">Time</FormLabel>
				<Input  name='time' hidden id='timerow' type='time'onChange={onChange} placeholder={NewAlarm.time} value={NewAlarm.time}/>
				<FormLabel  hidden id='wday_row' htmlFor="wday_row">Weekday</FormLabel>
				<Input  name='wday' hidden id='wdayrow' onChange={onChange} placeholder={NewAlarm.wday} value={NewAlarm.wday}/>
				<FormLabel  hidden id='date_row' htmlFor="date_row">Date</FormLabel>
				<Input  name='date' hidden id='daterow' type='date' onChange={onChange} placeholder={NewAlarm.date} value={NewAlarm.date}/>
				<FormLabel  hidden id='label_row' htmlFor="label_row">Label</FormLabel>
				<Input name='label' hidden id='labelrow' onChange={onChange} placeholder={NewAlarm.label} value={NewAlarm.label}/>
				<FormLabel  hidden id='devices_row' htmlFor="devices_row">Devices</FormLabel>
				<Input name='devices' hidden id='devicesrow' onChange={onChange} placeholder={NewAlarm.devices} value={NewAlarm.devices}/>
				</FormControl>
				</form>
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

export default AddAlarm;
