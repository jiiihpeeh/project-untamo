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
	const [Selected_larm, setSelected_larm] = useState({
		_id:0,
		occurence:0,
		time: 0,
		wday: 0,
		date: 0,
		label: 0,
		devices: 0,
		device_ids: 0,
		user: 0
	}); 
	let devicelist = JSON.parse(localStorage['devices'])
	const [deviges] = useState(devicelist)
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()
	const { userInfo, setUserInfo } = useContext(SessionContext);
	var alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms] = useState(alarmlist)
	let checked_radio

	const onOpenMod = () => {
		var radios = document.getElementsByName('radjo');
		for (var i = 0, length = radios.length; i < length; i++) {
			if (radios[i].checked) {
				checked_radio=radios[i].value
				let rokko=JSON.parse(checked_radio)
				console.log('EALoop/Checked_radio_id:'+rokko._id)
				setSelected_larm(rokko)
			} else {
				console.log("No radio selected")
			}
		}
		onOpen()
	}

	const renderDevices = () => {
		return deviges.map(({ id, deviceName, type }) => {
			for (let i = 0; i < Selected_larm.device_ids.length; i++) {
				if(id==Selected_larm.device_ids[i]){
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
		setSelected_larm((Selected_larm) => {
			return {
				...Selected_larm,
				[event.target.name] : event.target.value
			};
		})
	}

	const onRegister = async () => {
		try {
			console.log("Try: /api/alarm/"+Selected_larm._id,Selected_larm)
			const res = await axios.put('/api/alarm/'+Selected_larm._id,Selected_larm );
			console.log(res.data);
			notification("Edit Alarm", "Alarm succesfully modified")
			var oldAlarms=JSON.parse(localStorage.getItem('alarms')) || [];
			for (let i = 0; i < oldAlarms.length; i++) {
				if(oldAlarms[i]._id==Selected_larm._id) {
					oldAlarms.splice(i,1)
					props.updateAlarms(oldAlarms)
				}
			}
			oldAlarms.push(Selected_larm)
			localStorage.setItem('alarms', JSON.stringify(oldAlarms))
		} catch (err){
			console.error(err)
			notification("Edit Alarm", "Alarm edit save failed", "error")
		}
	}

let idRow=<><FormLabel>ID: {Selected_larm._id}</FormLabel></>

let occurenceRow=<><FormLabel htmlFor="occu_row">Occurence</FormLabel>
<Select name="occurence" onChange={onChange}>
	<option value={Selected_larm.occurence}>{Selected_larm.occurence}</option>
	<option value="once">once</option>
	<option value="daily">daily</option>
	<option value="weekly">weekly</option>
	<option value="yearly">yearly</option>
</Select></>

let timeRow_hidden=<></>
let timeRow_show=<><FormLabel htmlFor="time">Time</FormLabel>
		<Input name='time' type='time'onChange={onChange} value={Selected_larm.time}/></>
let timeRow=timeRow_hidden

let wdayRow_hidden=<></>
let wdayRow_show=<><FormLabel htmlFor="wday">Weekday</FormLabel>
		<div>
		<Select name="wday" onChange={onChange}>
			<option value={Selected_larm.wday}>{Selected_larm.wday}</option>
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
let dateRow_show=<><FormLabel htmlFor="date">Date</FormLabel>
<Input  name='date' type='date' onChange={onChange} defaultValue={Selected_larm.date}/></>
let dateRow=dateRow_hidden

let labelRow_hidden=<></>
let labelRow_show=<><FormLabel htmlFor="label">Label</FormLabel>
<Input name='label' onChange={onChange} defaultValue={Selected_larm.label}/></>
let labelRow=labelRow_hidden

let devicesRow_hidden=<></>
let devicesRow_show=<><FormLabel htmlFor="devices_row">Devices</FormLabel>
<span>{renderDevices()}</span></>
let devicesRow=devicesRow_hidden

if(Selected_larm.occurence){
	devicesRow=devicesRow_show;
	labelRow=labelRow_show;
	timeRow=timeRow_show;
	}
if(Selected_larm.occurence=='Select Occurence'){
	devicesRow=devicesRow_hidden;
	labelRow=labelRow_hidden;
	timeRow=timeRow_hidden;
	wdayRow=wdayRow_hidden;
	dateRow=dateRow_hidden;
	}
if(Selected_larm.occurence=='once'){
	wdayRow=wdayRow_hidden
	Selected_larm.wday=''
	dateRow=dateRow_show
	}
if(Selected_larm.occurence=='daily'){
	wdayRow=wdayRow_hidden
	Selected_larm.wday=''
	dateRow=dateRow_hidden
	Selected_larm.date=''
}
if(Selected_larm.occurence=='weekly'){
	wdayRow=wdayRow_show
	dateRow=dateRow_hidden
	Selected_larm.date=''
	Selected_larm.wday='Monday'
}
if(Selected_larm.occurence=='yearly'){
	wdayRow=wdayRow_hidden
	Selected_larm.wday=''
	dateRow=dateRow_show
}

	return (
		<>
		<Link onClick={onOpenMod}><Text as='b'>
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