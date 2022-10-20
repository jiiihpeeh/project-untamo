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
	Box,
	HStack
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useContext } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import { notification } from './notification';
let selType=''
let device_ids=new Array();
let sel_dev=new Array();
let TempAlarm= new Array();
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
		device_ids: 0,
		devices:0
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
					sel_dev.push(deviges[i].deviceName)
				}
			}
			NewAlarm.device_ids=device_ids;
			NewAlarm.devices=sel_dev;
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

	const onCloseMod = () => {
		NewAlarm.occurence='Select Occurence';
		NewAlarm.time='12:00';
		NewAlarm.wday="0";
		NewAlarm.date='2022-12-24';
		NewAlarm.label='NewAlarm';
		NewAlarm.device_ids="0";
		NewAlarm.devices="0";
		selType=''
		device_ids=new Array();
		sel_dev=new Array();
		onClose();
	}
// Add Alarm Device selection:

var devicelist = JSON.parse(localStorage['devices'])
	const [deviges] = useState(devicelist)
const renderDevices = () => {
	return deviges.map(({ id, deviceName, type }) => {
	return <HStack spacing='10px' key={id}>
		<Box w='20px' h='6'>
	<input type='checkbox' name="tickbox" value={id} ></input></Box>
	<Box w='170px' h='6'>{deviceName}</Box>
	<Box w='170px' h='6'>{type}</Box>
	</HStack>
	})
}

//Conditional Add Alarm Rows:
//timeRow
let timeRow_hidden=<></>
let timeRow_show=<><FormLabel id='time_row' htmlFor="time_row">Time</FormLabel>
	<Input  name='time' id='timerow' type='time'onChange={onChange} placeholder={NewAlarm.time} value={NewAlarm.time}/></>
let timeRow=timeRow_hidden
//wdayRow
let wdayRow_hidden=<></>
let wdayRow_show=<><FormLabel id='wday_row' htmlFor="wday_row">Weekday</FormLabel>
		<div id='wdayrow'>
		<Select name="wday" onChange={onChange}>
			<option value="Monday">Monday</option>
			<option value="Tuesday">Tuesday</option>
			<option value="Wednesday">Wednesday</option>
			<option value="Thursday">Thursday</option>
			<option value="Friday">Friday</option>
			<option value="Saturday">Saturday</option>
			<option value="Sunday">Sunday</option>
		</Select></div></>
let wdayRow=wdayRow_hidden
//dateRow
let dateRow_hidden=<></>
let dateRow_show=<><FormLabel id='date_row' htmlFor="date_row">Date</FormLabel>
<Input  name='date' id='daterow' type='date' onChange={onChange} placeholder={NewAlarm.date} value={NewAlarm.date}/></>
let dateRow=dateRow_hidden
//labelRow
let labelRow_hidden=<></>
let labelRow_show=<><FormLabel id='label_row' htmlFor="label_row">Label</FormLabel>
<Input name='label' id='labelrow' onChange={onChange} placeholder={NewAlarm.label} value={NewAlarm.label}/></>
let labelRow=labelRow_hidden
//devicesRow
let devicesRow_hidden=<></>
let devicesRow_show=<><FormLabel id='devices_row' htmlFor="devices_row">Devices</FormLabel>
<span id='devicesrow'>{renderDevices()}</span></>
let devicesRow=devicesRow_hidden

//Conditions based on occurence selection:

if(selType){
	devicesRow=devicesRow_show;
	labelRow=labelRow_show;
	timeRow=timeRow_show;
	}

if(selType=='once'){
	wdayRow=wdayRow_hidden
	NewAlarm.wday=''
	dateRow=dateRow_show
	}

if(selType=='daily'){
	wdayRow=wdayRow_hidden
	NewAlarm.wday=''
	dateRow=dateRow_hidden
	NewAlarm.date=''
}

if(selType=='weekly'){
	wdayRow=wdayRow_show
	dateRow=dateRow_hidden
	NewAlarm.date=''
}

if(selType=='yearly'){
	wdayRow=wdayRow_hidden
	NewAlarm.wday=''
	dateRow=dateRow_show
}

	return (
		<>
		<Link onClick={onOpen}><Text as='b'>
		Add Alarm
		</Text></Link>
		<Drawer
			isOpen={isOpen}
			placement='left'
			onClose={onCloseMod}
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
				{timeRow}
				{wdayRow}
				{dateRow}
				{labelRow}
				{devicesRow}
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