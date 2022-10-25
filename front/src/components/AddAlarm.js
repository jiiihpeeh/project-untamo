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
	HStack,
	Center
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useContext } from 'react'
import axios from 'axios';
import { notification } from './notification';
import { AlarmContext } from '../contexts/AlarmContext';
import { json } from 'react-router-dom';

let selType=''
let TempWday=[];
let mon_state=0
let tue_state=0
let wed_state=0
let thu_state=0
let fri_state=0
let sat_state=0
let sun_state=0
let wday_mon, wday_tue, wday_wed, wday_thu, wday_fri, wday_sat, wday_sun
let device_ids=[];
let sel_dev=[];
let TempAlarm=[];

function AddAlarm(props) {
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
	let temp_states={
		Monday: 0,
		Tuesday: 0,
		Wednesday: 0,
		Thursday: 0,
		Friday: 0,
		Saturday: 0,
		Sunday: 0}
	let [selected_wday, setSelected_wday] = useState(temp_states)
	let toukeni = localStorage.getItem("token")
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()
	const { setAlarms } = useContext(AlarmContext);
	const onChange = (event) => {
		if(event.target.name==='occurence'){	
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
			if(selected_wday.Monday===1){TempWday.push('Monday')}
			if(selected_wday.Tuesday===1){TempWday.push('Tuesday')}
			if(selected_wday.Wednesday===1){TempWday.push('Wednesday')}
			if(selected_wday.Thursday===1){TempWday.push('Thursday')}
			if(selected_wday.Friday===1){TempWday.push('Friday')}
			if(selected_wday.Saturday===1){TempWday.push('Saturday')}
			if(selected_wday.Sunday===1){TempWday.push('Sunday')}
			NewAlarm.wday= Array.from(new Set(TempWday));
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
			setAlarms(oldAlarms);
		} catch (err){
			console.error(err)
			notification("Add Alarm", "Alarm save failed", "error")	
		}
	}

	const onCloseMod = () => {
		NewAlarm.occurence='Select Occurence';
		NewAlarm.time='12:00';
		NewAlarm.wday='';
		mon_state=0;
		tue_state=0;
		wed_state=0;
		thu_state=0;
		fri_state=0;
		sat_state=0;
		sun_state=0;
		TempWday=[];
		temp_states='';
		NewAlarm.date='2022-12-24';
		NewAlarm.label='NewAlarm';
		NewAlarm.device_ids="0";
		NewAlarm.devices="0";
		selType=''
		device_ids=[];
		sel_dev=[];
		setSelected_wday('')
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

const renderWdays =() => {
	if(mon_state===1){
		wday_mon=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Monday')} borderWidth='2px' borderColor='black' borderRadius='md'>
		<Center h='36px'>
		Mon
		</Center>
		</Button>
	}
	if(mon_state===0){
		wday_mon=<Button w='40px' h='40px' bg='gray.200' onClick={() => wdaySelect('Monday')} borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
		Mon
		</Center>
		</Button>
	}

	if(tue_state===1){
		wday_tue=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Tuesday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
		Tue
		</Center>
		</Button>
	}
	if(tue_state===0){
		wday_tue=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Tuesday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
		<Center h='36px'>
		Tue
		</Center>
		</Button>
	}

	if(wed_state===1){
		wday_wed=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Wednesday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
		Wed
		</Center>
		</Button>
	}
	if(wed_state===0){
		wday_wed=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Wednesday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
		<Center h='36px'>
		Wed
		</Center>
		</Button>
	}

	if(thu_state===1){
		wday_thu=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Thursday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
		Thu
		</Center>
		</Button>
	}
	if(thu_state===0){
		wday_thu=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Thursday')} borderWidth='2px' borderColor='black' borderRadius='md' >
		<Center h='36px'>
		Thu
		</Center>
		</Button>
	}

	if(fri_state===1){
		wday_fri=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Friday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
		Fri
		</Center>
		</Button>
	}
	if(fri_state===0){
		wday_fri=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Friday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
		<Center h='36px'>
		Fri
		</Center>
		</Button>
	}

	if(sat_state===1){
		wday_sat=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Saturday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
		Sat
		</Center>
		</Button>
	}
	if(sat_state===0){
		wday_sat=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Saturday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
		<Center h='36px'>
		Sat
		</Center>
		</Button>
	}

	if(sun_state===1){
		wday_sun=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Sunday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
		Sun
		</Center>
		</Button>
	}
	if(sun_state===0){
		wday_sun=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Sunday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
		<Center h='36px'>
		Sun
		</Center>
		</Button>
	}
}

const wdaySelect = (wdayid) => {
	temp_states.Monday=mon_state
	temp_states.Tuesday=tue_state
	temp_states.Wednesday=wed_state
	temp_states.Thursday=thu_state
	temp_states.Friday=fri_state
	temp_states.Saturday=sat_state
	temp_states.Sunday=sun_state
	if(wdayid==='Monday'){
		if(mon_state===1){mon_state=0}
		else if(mon_state===0){mon_state=1}
		temp_states.Monday=mon_state
		setSelected_wday(temp_states)
	} 
	if(wdayid==='Tuesday'){
		if(tue_state===1){tue_state=0}
		else if(tue_state===0){tue_state=1}
		temp_states.Tuesday=tue_state
		setSelected_wday(temp_states)
		}
	if(wdayid==='Wednesday'){
		if(wed_state===1){wed_state=0}
		else if(wed_state===0){wed_state=1}
		temp_states.Wednesday=wed_state
		setSelected_wday(temp_states)
		}
	if(wdayid==='Thursday'){
		if(thu_state===1){thu_state=0}
		else if(thu_state===0){thu_state=1}
		temp_states.Thursday=thu_state
		setSelected_wday(temp_states)
	}
	if(wdayid==='Friday'){
		if(fri_state===1){fri_state=0}
		else if(fri_state===0){fri_state=1}
		temp_states.Friday=fri_state
		setSelected_wday(temp_states)
	}
	if(wdayid==='Saturday'){
		if(sat_state===1){sat_state=0}
		else if(sat_state===0){sat_state=1}
		temp_states.Saturday=sat_state
		setSelected_wday(temp_states)
	}
	if(wdayid==='Sunday'){
		if(sun_state===1){sun_state=0}
		else if(sun_state===0){sun_state=1}
		temp_states.Sunday=sun_state
		setSelected_wday(temp_states)
	}
	}
//Conditional Add Alarm Rows:
//timeRow
let timeRow_hidden=<></>
let timeRow_show=<><FormLabel>Time</FormLabel>
	<Input  name='time' id='timerow' type='time'onChange={onChange} placeholder={NewAlarm.time} value={NewAlarm.time}/></>
let timeRow=timeRow_hidden
//wdayRow
let wdayRow_hidden=<></>
let wdayRow_show=<><FormLabel>Weekday</FormLabel>
		<Center h='60px'><HStack spacing='12px'>
		{wday_mon}
		{wday_tue}
		{wday_wed}
		{wday_thu}
		{wday_fri}
		{wday_sat}
		{wday_sun}
		</HStack></Center>
		</>
let wdayRow=wdayRow_hidden
//dateRow
let dateRow_hidden=<></>
let dateRow_show=<><FormLabel>Date</FormLabel>
<Input  name='date' id='daterow' type='date' onChange={onChange} placeholder={NewAlarm.date} value={NewAlarm.date}/></>
let dateRow=dateRow_hidden
//labelRow
let labelRow_hidden=<></>
let labelRow_show=<><FormLabel>Label</FormLabel>
<Input name='label' id='labelrow' onChange={onChange} placeholder={NewAlarm.label} value={NewAlarm.label}/></>
let labelRow=labelRow_hidden
//devicesRow
let devicesRow_hidden=<></>
let devicesRow_show=<><FormLabel>Devices</FormLabel>
{renderDevices()}</>
let devicesRow=devicesRow_hidden
//SaveButton
let saveBut_hidden=<Button colorScheme='gray'>Save</Button>
let saveBut_show=<Button colorScheme='green' onClick={onRegister}>Save</Button>
let saveBut=saveBut_hidden

//Conditions based on occurence selection:

if(selType){
	devicesRow=devicesRow_show;
	labelRow=labelRow_show;
	timeRow=timeRow_show;
	saveBut=saveBut_hidden;

	}
if(selType==='Select Occurence'){
	devicesRow=devicesRow_hidden;
	labelRow=labelRow_hidden;
	timeRow=timeRow_hidden;
	wdayRow=wdayRow_hidden;
	dateRow=dateRow_hidden;
	}
if(selType==='once'){
	wdayRow=wdayRow_hidden
	NewAlarm.wday=''
	dateRow=dateRow_show
	saveBut=saveBut_show
	}

if(selType==='daily'){
	wdayRow=wdayRow_hidden
	NewAlarm.wday=''
	dateRow=dateRow_hidden
	NewAlarm.date=''
	saveBut=saveBut_show
}

if(selType==='weekly'){
	wdayRow=wdayRow_show
	dateRow=dateRow_hidden
	NewAlarm.date=''
	saveBut=saveBut_hidden
	if(JSON.stringify(selected_wday).includes('1')){
		saveBut=saveBut_show
	}
}

if(selType==='yearly'){
	wdayRow=wdayRow_hidden
	NewAlarm.wday=''
	dateRow=dateRow_show
	saveBut=saveBut_show
}
renderWdays()
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
		<DrawerOverlay/>
		<DrawerContent>
			<DrawerCloseButton/>
			<DrawerHeader>Add Alarm</DrawerHeader>
			<DrawerBody>
			<form 
				id='add-alarm-form'
				onSubmit={onRegister}
            >
			<FormControl>
			<FormLabel>Occurence</FormLabel>
				<Select name="occurence" onChange={onChange}>
					<option value="Select Occurence">Select Occurence</option>
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
					{saveBut}
				</DrawerFooter>
			</DrawerContent>
			</Drawer>
		</>
		)
	}

export default AddAlarm;