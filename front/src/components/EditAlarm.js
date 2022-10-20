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
	FormLabel,
	Input,
	Select,
	FormControl,
	HStack,
	Box,
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useContext } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import { notification } from './notification';

function EditAlarm(props) {
	var [Selected_alarm, setSelected_alarm] = useState({
		_id: props.lollo._id,
		occurence: props.lollo.occurence,
		time: props.lollo.time,
		wday: props.lollo.wday,
		date: props.lollo.date,
		label: props.lollo.label,
		devices: props.lollo.devices,
		device_ids: props.lollo.device_ids
	});
	var devicelist = JSON.parse(localStorage['devices'])
	const [deviges] = useState(devicelist)
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()
	const { userInfo, setUserInfo } = useContext(SessionContext);
	var alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms] = useState(alarmlist)

	// Check if no row selected:
	if(typeof props.lollo._id=='undefined'){
		console.log("NO selection made")
		return<Text as='b'>
	Edit Alarm
	</Text>
	}

	const renderDevices = () => {
		return deviges.map(({ id, deviceName, type }) => {
			for (let i = 0; i < Selected_alarm.device_ids.length; i++) {
				if(id==Selected_alarm.device_ids[i]){
					return <HStack spacing='10px' key={id}>
					<Box w='20px' h='6'>
				<input type='checkbox' name="tickbox" value={id} defaultChecked></input></Box>
				<Box w='170px' h='6'>{deviceName}</Box>
				<Box w='170px' h='6'>{type}</Box>
				</HStack>
				}
			}
		return <HStack spacing='10px' key={id}>
			<Box w='20px' h='6'>
		<input type='checkbox' name="tickbox" value={id} ></input></Box>
		<Box w='170px' h='6'>{deviceName}</Box>
		<Box w='170px' h='6'>{type}</Box>
		</HStack>
		})
	}

	const onChange = (event) => {
		console.log(event.target.name+":"+event.target.value)
		setSelected_alarm((Selected_alarm) => {
			return {
				...Selected_alarm,
				[event.target.name] : event.target.value
			};
		})
		
	}


	const onRegister = async (event) => {
		try {
			console.log("Try: /api/alarm/"+Selected_alarm._id,Selected_alarm)
			const res = await axios.put('/api/alarm/'+Selected_alarm._id,Selected_alarm );
			console.log(res.data);
			notification("Edit Alarm", "Alarm succesfully modified")
		} catch (err){
			console.error(err)
			notification("Edit Alarm", "Alarm edit save failed", "error")
		}
	}

let idRow=<><FormLabel>ID: {Selected_alarm._id}</FormLabel></>

let occurenceRow=<><FormLabel htmlFor="occu_row">Occurence</FormLabel>
<Select name="occurence" onChange={onChange}>
	<option value={Selected_alarm.occurence}>{Selected_alarm.occurence}</option>
	<option value="once">once</option>
	<option value="daily">daily</option>
	<option value="weekly">weekly</option>
	<option value="yearly">yearly</option>
</Select></>

let timeRow_hidden=<></>
let timeRow_show=<><FormLabel id='time_row' htmlFor="time_row">Time</FormLabel>
	<Input  name='time' id='timerow' type='time'onChange={onChange} placeholder={Selected_alarm.time} value={Selected_alarm.time}/></>
let timeRow=timeRow_hidden

let wdayRow_hidden=<></>
let wdayRow_show=<><FormLabel id='wday_row' htmlFor="wday_row">Weekday</FormLabel>
		<div id='wdayrow'>
		<Select name="wday" onChange={onChange}>
			<option value={Selected_alarm.wday}>{Selected_alarm.wday}</option>
			<option value="Monday">Monday</option>
			<option value="Tuesday">Tuesday</option>
			<option value="Wednesday">Wednesday</option>
			<option value="Thursday">Thursday</option>
			<option value="Friday">Friday</option>
			<option value="Saturday">Saturday</option>
			<option value="Sunday">Sunday</option>
		</Select></div></>
let wdayRow=wdayRow_hidden


let dateRow_hidden=<></>
let dateRow_show=<><FormLabel id='date_row' htmlFor="date_row">Date</FormLabel>
<Input  name='date' id='daterow' type='date' onChange={onChange} placeholder={Selected_alarm.date} value={Selected_alarm.date}/></>
let dateRow=dateRow_hidden

let labelRow_hidden=<></>
let labelRow_show=<><FormLabel id='label_row' htmlFor="label_row">Label</FormLabel>
<Input name='label' id='labelrow' onChange={onChange} placeholder={Selected_alarm.label} value={Selected_alarm.label}/></>
let labelRow=labelRow_hidden

let devicesRow_hidden=<></>
let devicesRow_show=<><FormLabel id='devices_row' htmlFor="devices_row">Devices</FormLabel>
<span id='devicesrow'>{renderDevices()}</span></>
let devicesRow=devicesRow_hidden

if(Selected_alarm.occurence){
	devicesRow=devicesRow_show;
	labelRow=labelRow_show;
	timeRow=timeRow_show;
	}
if(Selected_alarm.occurence=='Select Occurence'){
	devicesRow=devicesRow_hidden;
	labelRow=labelRow_hidden;
	timeRow=timeRow_hidden;
	wdayRow=wdayRow_hidden;
	dateRow=dateRow_hidden;
	}
if(Selected_alarm.occurence=='once'){
	wdayRow=wdayRow_hidden
	Selected_alarm.wday=''
	dateRow=dateRow_show
	}
if(Selected_alarm.occurence=='daily'){
	wdayRow=wdayRow_hidden
	Selected_alarm.wday=''
	dateRow=dateRow_hidden
	Selected_alarm.date=''
}
if(Selected_alarm.occurence=='weekly'){
	wdayRow=wdayRow_show
	dateRow=dateRow_hidden
	Selected_alarm.date=''
	Selected_alarm.wday=Selected_alarm.wday
}
if(Selected_alarm.occurence=='yearly'){
	wdayRow=wdayRow_hidden
	Selected_alarm.wday=''
	dateRow=dateRow_show
}

	return (
		<>
		<Link onClick={onOpen}><Text as='b'>
		Edit Alarm
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
			<DrawerHeader>Edit Alarm</DrawerHeader>
			<DrawerBody>
			<form id='edit-alarm-form' onSubmit={onRegister}>
			<FormControl>
						{idRow}
						{occurenceRow}
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

export default EditAlarm;