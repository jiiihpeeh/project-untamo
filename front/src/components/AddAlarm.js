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
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useContext } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import {
	Table,
	Tbody,
	Tr,
	Td,
	TableContainer,
	} from '@chakra-ui/react'
import { notification } from './notification';

function AddAlarm() {
	var [NewAlarm, setNewAlarm] = useState({
		occurence: 'SelectOccurence',
		time: '12:00',
		wday: 0,
		date: '24.12.2022',
		label: 'NewAlarm',
		devices: 0
	});
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()
	const { userInfo, setUserInfo } = useContext(SessionContext);

//	
	const onChange = (event) => {
		
		console.log(event.target.name+":"+event.target.value)
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
				<TableContainer>
					<Table variant='striped' colorScheme='teal' size='sm' className="table-addalarm">
					<Tbody> 
						<Tr><Td><label htmlFor="occu">Occurence: </label></Td><Td><select id="occu" name="occu" onChange={onChange}><option value={NewAlarm.occurence}>{NewAlarm.occurence}</option><option value="once">once</option><option value="weekly">weekly</option><option value="yearly">yearly</option></select></Td></Tr>
						<Tr><Td><label htmlFor="time">Time: </label></Td><Td><input type="time" id="time" name="time" value={NewAlarm.time} onChange={onChange}/></Td></Tr>
						<Tr><Td><label htmlFor="wday">Weekday: </label></Td><Td><input name="wday" placeholder={NewAlarm.wday} size="30" onChange={onChange}/></Td></Tr>
						<Tr><Td><label htmlFor="date">Date: </label></Td><Td><input name="date" placeholder={NewAlarm.date} size="30" onChange={onChange}/></Td></Tr>
						<Tr><Td><label htmlFor="label">Label: </label></Td><Td><input name="label" placeholder={NewAlarm.label} size="30" onChange={onChange}/></Td></Tr>
						<Tr><Td><label htmlFor="devices">Devices: </label></Td><Td><input name="devices" readOnly placeholder={NewAlarm.devices} size="30"/></Td></Tr>
					</Tbody>
					</Table>
				</TableContainer>
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
