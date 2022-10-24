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
	Center
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useContext } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import { notification } from './notification';
import { joinPaths } from '@remix-run/router';

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
	let wday_mon
	let wday_tue
	let wday_wed, wday_thu, wday_fri, wday_sat, wday_sun
	let mon_state=0
let tue_state=0
let wed_state=0
let thu_state=0
let fri_state=0
let sat_state=0
let sun_state=0
let temp_states={
	Monday: 0,
	Tuesday: 0,
	Wednesday: 0,
	Thursday: 0,
	Friday: 0,
	Saturday: 0,
	Sunday: 0}
	let [selected_wday, setSelected_wday] = useState(temp_states)
let wday_result
	let devicelist = JSON.parse(localStorage['devices'])
	const [deviges] = useState(devicelist)
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()
	const { userInfo, setUserInfo } = useContext(SessionContext);
	var alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms] = useState(alarmlist)
	const [buttonstate, setButtonstate] = useState(temp_states)
	let checked_radio
	let TempWday=new Array();

	const onOpenMod = () => {
		//console.log("OnOpenMod/Selected_wdays: "+selected_wday.Monday+", "+selected_wday.Tuesday+", "+selected_wday.Wednesday+", "+selected_wday.Thursday+", "+selected_wday.Friday+", "+selected_wday.Saturday+", "+selected_wday.Sunday )
		var radios = document.getElementsByName('radjo');
		for (var i = 0, length = radios.length; i < length; i++) {
			if (radios[i].checked) {
				checked_radio=radios[i].value
				let rokko=JSON.parse(checked_radio)
				//console.log('EALoop/Checked_radio_id:'+rokko._id)
				for (let i = 0; i < rokko.wday.length; i++) {
					if(rokko.wday[i]=='Monday'){mon_state=1}
					if(rokko.wday[i]=='Tuesday'){tue_state=1}
					if(rokko.wday[i]=='Wednesday'){wed_state=1}
					if(rokko.wday[i]=='Thuday'){thu_state=1}
					if(rokko.wday[i]=='Friday'){fri_state=1}
					if(rokko.wday[i]=='Saturday'){sat_state=1}
					if(rokko.wday[i]=='Sunday'){sun_state=1}
				}
				//console.log('wed_satet:'+wed_state)
				temp_states.Monday=mon_state
				temp_states.Tuesday=tue_state
				temp_states.Wednesday=wed_state
				temp_states.Thursday=thu_state
				temp_states.Friday=fri_state
				temp_states.Saturday=sat_state
				temp_states.Sunday=sun_state
//console.log("OnOpenMod/rokko.wday:"+JSON.stringify(rokko.wday))
//console.log("OnOpenMod/rokko:"+JSON.stringify(rokko))

				setSelected_larm(rokko)
				console.log("OnLOADBUTTONSTATES: "+JSON.stringify(buttonstate)+" - Tempstates: "+JSON.stringify(temp_states))
			//	console.log("mon_state: "+mon_state)
				setButtonstate(temp_states)
		//		setSelected_wday(temp_states)

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
	const renderWdays =() => {
		//console.log("renderWdaysBUttonstates: "+JSON.stringify(buttonstate)+" - Tempstates: "+JSON.stringify(temp_states))
		//console.log("RenderWdays/Selected_wdays: "+JSON.stringify(selected_wday))
		//console.log("RenderWDays/mon_state: "+mon_state)

		//MO
		if(buttonstate.Monday==0){
		wday_mon=<><Button w='40px' h='40px' bg='gray.200' onClick={() => wdaySelect('Monday')} borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
		Mon
		</Center>
		</Button></>

	}
		if(buttonstate.Monday==1){
			wday_mon=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Monday')} borderWidth='2px' borderColor='black' borderRadius='md'>
			<Center h='36px'>
			Mon
			</Center>
			</Button>
		}
		//TU
		if(buttonstate.Tuesday==0){
			wday_tue=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Tuesday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
		<Center h='36px'>
		Tue
		</Center>
		</Button>
		}
		if(buttonstate.Tuesday==1){
			wday_tue=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Tuesday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
			Tue
			</Center>
			</Button>
		}
		//WE
		if(buttonstate.Wednesday==0){
			wday_wed=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Wednesday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
			<Center h='36px'>
			Wed
			</Center>
			</Button>
		}
		if(buttonstate.Wednesday==1){
			wday_wed=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Wednesday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
			Wed
			</Center>
			</Button>
		}
				//TH
				if(buttonstate.Thursday==0){
					wday_thu=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Thursday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
					<Center h='36px'>
					Thu
					</Center>
					</Button>
				}
				if(buttonstate.Thursday==1){
					wday_thu=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Thursday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
					Thu
					</Center>
					</Button>
				}
//FR
if(buttonstate.Friday==0){
	wday_fri=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Friday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
	<Center h='36px'>
	Fri
	</Center>
	</Button>
}
if(buttonstate.Friday==1){
	wday_fri=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Friday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
	Fri
	</Center>
	</Button>
}
//SA
if(buttonstate.Saturday==0){
	wday_sat=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Saturday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
	<Center h='36px'>
	Sat
	</Center>
	</Button>
}
if(buttonstate.Saturday==1){
	wday_sat=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Saturday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
	Sat
	</Center>
	</Button>
}
//Su
if(buttonstate.Sunday==0){
	wday_sun=<Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Sunday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
	<Center h='36px'>
	Sun
	</Center>
	</Button>
}
if(buttonstate.Sunday==1){
	wday_sun=<Button w='40px' h='40px' bg='green' onClick={() => wdaySelect('Sunday')}  borderWidth='2px' borderColor='black' borderRadius='md'><Center h='36px'>
	Sun
	</Center>
	</Button>
}
		return[wday_mon,wday_tue,wday_wed,wday_thu,wday_fri,wday_sat,wday_sun]
		
		
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
			
			if(buttonstate.Monday==1){TempWday.push('Monday')}
			if(buttonstate.Tuesday==1){TempWday.push('Tuesday')}
			if(buttonstate.Wednesday==1){TempWday.push('Wednesday')}
			if(buttonstate.Thursday==1){TempWday.push('Thursday')}
			if(buttonstate.Friday==1){TempWday.push('Friday')}
			if(buttonstate.Saturday==1){TempWday.push('Saturday')}
			if(buttonstate.Sunday==1){TempWday.push('Sunday')}
			console.log("REGISTER: "+TempWday)
			Selected_larm.wday=TempWday;
			console.log("PERKELE=?: "+JSON.stringify(Selected_larm))
			
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

const wdaySelect = (wdayid) => {
	temp_states.Monday=buttonstate.Monday
	temp_states.Tuesday=buttonstate.Tuesday
	temp_states.Wednesday=buttonstate.Wednesday
	temp_states.Thursday=buttonstate.Thursday
	temp_states.Friday=buttonstate.Friday
	temp_states.Saturday=buttonstate.Saturday
	temp_states.Sunday=buttonstate.Sunday
	if(wdayid=='Monday'){
		if(temp_states.Monday==0){temp_states.Monday=1}
		else if(temp_states.Monday==1){temp_states.Monday=0}
		mon_state=temp_states.Monday
		console.log("WDaySelect/mon_state: "+mon_state)
		console.log("WDaySelect/temp_states: "+JSON.stringify(temp_states))
	setButtonstate(temp_states)
	} 
	if(wdayid=='Tuesday'){
		if(temp_states.Tuesday==1){temp_states.Tuesday=0}
		else if(temp_states.Tuesday==0){temp_states.Tuesday=1}
		tue_state=temp_states.Tuesday
		setButtonstate(temp_states)
		}
	if(wdayid=='Wednesday'){
		if(temp_states.Wednesday==1){temp_states.Wednesday=0}
		else if(temp_states.Wednesday==0){temp_states.Wednesday=1}
		wed_state=temp_states.Wednesday
		setButtonstate(temp_states)
		}
	if(wdayid=='Thursday'){
		if(temp_states.Thursday==1){temp_states.Thursday=0}
		else if(temp_states.Thursday==0){temp_states.Thursday=1}
		thu_state=temp_states.Thursday
		setButtonstate(temp_states)
	}
	if(wdayid=='Friday'){
		if(temp_states.Friday==1){temp_states.Friday=0}
		else if(temp_states.Friday==0){temp_states.Friday=1}
		fri_state=temp_states.Friday
		setButtonstate(temp_states)
	}
	if(wdayid=='Saturday'){
		if(temp_states.Saturday==1){temp_states.Saturday=0}
		else if(temp_states.Saturday==0){temp_states.Saturday=1}
		sat_state=temp_states.Saturday
		setButtonstate(temp_states)
	}
	if(wdayid=='Sunday'){
		if(temp_states.Sunday==1){temp_states.Sunday=0}
		else if(temp_states.Sunday==0){temp_states.Sunday=1}
		sun_state=temp_states.Sunday
		setButtonstate(temp_states)
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
let wdayRow_show=<><FormLabel >Weekday</FormLabel>
			<Center h='60px'><HStack spacing='12px'>
		{renderWdays()}
		</HStack></Center></>
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
renderWdays();
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