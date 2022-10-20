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
	Input,
	Container
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useContext } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import { notification } from './notification';
var selType=''
var device_ids=new Array();
var TempAlarm= new Array();
function AddAlarm(props) {
	var [Selected_devices, setSelected_alarm] = useState({
		id: 0,
	});
	var checked_radio
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
			var checks = document.getElementsByName('tickbox');
			for (var i = 0, length = checks.length; i < length; i++) {
				if (checks[i].checked) {
					checked_radio=checks[i].value
					device_ids.push(checked_radio)
				}
			}
			NewAlarm.devices=device_ids;
			const res = await axios.post('/api/alarm/'+localStorage.getItem('user'),NewAlarm );
			console.log("res.data:"+JSON.stringify(res.data));
			console.log(res.data.id)
			TempAlarm.push(NewAlarm)
			NewAlarm['_id']=res.data.id
			notification("Add Alarm", "Alarm succesfully added")
			var oldAlarms=JSON.parse(localStorage.getItem('alarms')) || [];
			oldAlarms.push(NewAlarm)
			localStorage.setItem('alarms', JSON.stringify(oldAlarms))
			props.updateAlarms(oldAlarms)
		} catch (err){
			console.error(err)
			notification("Add Alarm", "Alarm save failed", "error")	
		}
	}

if(typeof time_row !== 'undefined'){
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
		NewAlarm.wday=''
	} 
	if(selType=='daily'){
		document.getElementById('time_row').hidden=false
		document.getElementById('date_row').hidden=true
		document.getElementById('label_row').hidden=false
		document.getElementById('devices_row').hidden=false
		document.getElementById('timerow').hidden=false
		document.getElementById('daterow').hidden=true
		document.getElementById('labelrow').hidden=false
		document.getElementById('devicesrow').hidden=false
		document.getElementById('wdayrow').hidden=true
		document.getElementById('wday_row').hidden=true
		NewAlarm.wday=''
		NewAlarm.date=''
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
		NewAlarm.date=''
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
		NewAlarm.wday=''
	} 
}
var devicelist = JSON.parse(localStorage['devices'])
	const [deviges] = useState(devicelist)
const renderDevices = () => {
	return deviges.map(({ id, deviceName, type }) => {
	return <Container key={id} >
	<input type='checkbox' name="tickbox" value={id} ></input>
	{deviceName}
	{type}
	</Container>
	})
}

let kikkeli=<FormLabel htmlFor="occu_row">Occurence</FormLabel>
if(NewAlarm.occurence=='daily'){kikkeli=<FormLabel htmlFor="occu_row">kikkeli</FormLabel>}
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
				{kikkeli}
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
				<div id='wdayrow' hidden>
				<Select name="wday" onChange={onChange}>
					<option value={NewAlarm.occurence}>{NewAlarm.occurence}</option>
					<option value="once">once</option>
					<option value="daily">daily</option>
					<option value="weekly">weekly</option>
					<option value="yearly">yearly</option>
				</Select></div>
				<FormLabel  hidden id='date_row' htmlFor="date_row">Date</FormLabel>
				<Input  name='date' hidden id='daterow' type='date' onChange={onChange} placeholder={NewAlarm.date} value={NewAlarm.date}/>
				<FormLabel  hidden id='label_row' htmlFor="label_row">Label</FormLabel>
				<Input name='label' hidden id='labelrow' onChange={onChange} placeholder={NewAlarm.label} value={NewAlarm.label}/>
				<FormLabel  hidden id='devices_row' htmlFor="devices_row">Devices</FormLabel>
				<span id='devicesrow' hidden>{renderDevices()}</span>
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