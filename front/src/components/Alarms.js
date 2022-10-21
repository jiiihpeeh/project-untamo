import React, { useContext, useEffect } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import { useNavigate } from "react-router-dom";
import { Container, Heading} from '@chakra-ui/react';
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	HStack,
	Center
	} from '@chakra-ui/react'
import { useState } from 'react'
import EditAlarm from "./EditAlarm";
import AddAlarm from "./AddAlarm";
import DeleteAlarm from "./DeleteAlarm";

const Alarms = () => {
	let [Selected_alarm] = useState({
		_id: 0,
		occurence: 0,
		time: 0,
		wday: 0,
		date: 0,
		label: 0,
		devices: 0
	});
	const [ealarm] = useState({})
	const { token, sessionStatus } = useContext(SessionContext);
	const { currentDevice } = useContext(DeviceContext);
    const navigate = useNavigate();

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

	const radioOnChange=()=>{
		var radios = document.getElementsByName('radjo');
		let kekke = radios[0].value
		let selek = JSON.parse(kekke)
		for (var i = 0, length = radios.length; i < length; i++) {
			if (radios[i].checked) {
				Selected_alarm = alarms[i]
			}	
		}
	}

	let alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms, setAlarms] = useState(alarmlist)
	const renderAlarms = () => {
		return alarms.map(({ _id, occurence, time, wday, date, label, devices },numero) => {
		return <Tr key={_id}>
		<Td><input type='radio' name="radjo" value={JSON.stringify(alarms[numero])} onChange={radioOnChange}/></Td>
		<Td>{occurence}</Td>
		<Td>{time}</Td>
		<Td>{wday}</Td>
		<Td>{date}</Td>
		<Td>{label}</Td>
		<Td>{devices}</Td>
		</Tr>
		})
	}
	const updateAlarms = (alarmsChild) => setAlarms(alarmsChild)

	return (
		<Container bg='blue.200' maxW='fit-content'>
			<Heading size='sm'>List of Alarms for {localStorage.getItem('screenname')} {ealarm.label}</Heading>
			<TableContainer>
				<Table variant='striped' colorScheme='teal' size='sm' className="table-tiny" id='tabell'>
					<Thead>
						<Tr>
							<Th></Th>
							<Th>Occurence</Th>
							<Th isNumeric>Time</Th>
							<Th>Weekday</Th>
							<Th>date</Th>
							<Th>Label</Th>
							<Th>Devices</Th>
						</Tr>
					</Thead>
				<Tbody> 
					{renderAlarms()} 
				</Tbody>
				</Table>
			</TableContainer>
			<Center>
			<HStack spacing='30px'>
			<AddAlarm updateAlarms={updateAlarms}/><EditAlarm updateAlarms={updateAlarms}/><DeleteAlarm updateAlarms={updateAlarms}/></HStack></Center>
		</Container>
	)
}

export default Alarms;