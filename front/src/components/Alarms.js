import React, { useContext, useEffect, useState } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import { useNavigate } from "react-router-dom";
import {
	Container,
	Heading,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	HStack,
	Center,
	Switch,
	FormControl
	} from '@chakra-ui/react'
import EditAlarm from "./EditAlarm";
import AddAlarm from "./AddAlarm";
import DeleteAlarm from "./DeleteAlarm";
import { notification } from './notification';
import axios from 'axios';
import { AlarmContext } from '../contexts/AlarmContext';
import AddAlarmDrawer from "./AddAlarmDrawer";

const Alarms = () => {
	const [ealarm] = useState({})
	const { sessionStatus } = useContext(SessionContext);
	const { currentDevice } = useContext(DeviceContext);
    const navigate = useNavigate();
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { setAlarms } = useContext(AlarmContext);

	useEffect(() =>{
		if(!sessionStatus){
			navigate('/login');
		}
	},[sessionStatus])

	useEffect(() =>{
		if(!currentDevice){
			navigate('/welcome');
		}
	},[currentDevice])

	let alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms, setClarms] = useState(alarmlist)
	const renderAlarms = () => {
		let activerow
		let checkboxesChecked = [];

		return alarms.map(({ _id, occurence, time, wday, date, label, devices, active },numero) => {
			if(alarms[numero].active===1){
				checkboxesChecked.push(alarms[numero].value);
				activerow=<Td><FormControl display='flex' alignItems='center'>
				<Switch name='swjtch' id='alarm-active' defaultChecked value={JSON.stringify(alarms[numero])} size='md' onChange={(e) => activityChange(alarms[numero], e)}/>
				</FormControl></Td>
			} else if(alarms[numero].active===0){
				activerow=<Td><FormControl display='flex' alignItems='center'>
				<Switch name='swjtch' id='alarm-active'  value={JSON.stringify(alarms[numero])} size='md' onChange={(e) => activityChange(alarms[numero], e)}/>
				</FormControl></Td>
			}
		return <Tr key={_id}>
		<Td>{occurence}</Td>
		<Td>{time}</Td>
		<Td>{wday}</Td>
		<Td>{date}</Td>
		<Td>{label}</Td>
		{/* <Td>{devices.join(", ")}</Td> */}
		{activerow}
		<Td><DeleteAlarm updateAlarms={updateAlarms} valinta={alarms[numero]} /></Td>
		<Td><EditAlarm updateAlarms={updateAlarms} valinta={alarms[numero]}/></Td>
		</Tr>
		})
	}

	const activityChange = async (props) => {
		if(props.active===1){props.active=0}
		else if(props.active===0){props.active=1}
		try {
			console.log("Try: /api/alarm/"+props._id,props)
			const res = await axios.put('/api/alarm/'+props._id,props );
			console.log(res.data);
			notification("Edit Alarm", "Alarm succesfully modified")
			let oldAlarms=JSON.parse(localStorage.getItem('alarms')) || [];
			for (let i = 0; i < oldAlarms.length; i++) {
				if(oldAlarms[i]._id===props._id) {
					oldAlarms.splice(i,1)
				}
			}
			oldAlarms.push(props)
			localStorage.setItem('alarms', JSON.stringify(oldAlarms));
			setAlarms(oldAlarms)
		} catch (err){
			console.error(err)
			notification("Edit Alarm", "Alarm edit save failed", "error")
		}
	}

	const updateAlarms = (alarmsChild) => setClarms(alarmsChild)

	return (<>
		<Container bg='blue.200' maxW='fit-content'>
			<Heading size='sm'>List of Alarms for {localStorage.getItem('screenname')} {ealarm.label}</Heading>
			<TableContainer>
				<Table variant='striped' colorScheme='teal' size='sm' className="table-tiny" id='tabell'>
					<Thead>
						<Tr>
							<Th>Occurence</Th>
							<Th isNumeric>Time</Th>
							<Th>Weekday</Th>
							<Th>date</Th>
							<Th>Label</Th>
							{/* <Th>Devices</Th> */}
							<Th>Active</Th>
							<Th></Th>
							<Th></Th>
						</Tr>
					</Thead>
				<Tbody> 
					{renderAlarms()} 
				</Tbody>
				</Table>

			</TableContainer>
			
			<Center>
			<HStack spacing='30px'>
			<AddAlarm updateAlarms={updateAlarms}/></HStack></Center>

			
		</Container>

		<AddAlarmDrawer/>
	</>)
}

export default Alarms;