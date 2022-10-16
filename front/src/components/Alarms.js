import React, { useContext, useEffect } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import { useNavigate } from "react-router-dom";
import { Container, Button, Heading} from '@chakra-ui/react';
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	} from '@chakra-ui/react'
import { useState } from 'react'

const Alarms = () => {
	const { token, sessionStatus } = useContext(SessionContext);
	const { currentDevice } = useContext(DeviceContext);
    const navigate = useNavigate();




	useEffect(() =>{
		if(!sessionStatus){
			navigate('/login');
		}
	},[token, sessionStatus])

	useEffect(() =>{
		if(!currentDevice){
			navigate('/welcome');
		}
	},[currentDevice])

	var alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms] = useState(alarmlist)

	const onEdit = (event) => {
		var radios = document.getElementsByName('radjo');
		for (var i = 0, length = radios.length; i < length; i++) {
			if (radios[i].checked) {
			console.log("selected: "+radios[i].value);
			break;
			}
		}
	}
	

	const renderAlarms = () => {
		return alarms.map(({ _id, occurence, time, wday, date, label, devices }) => {
		return <Tr key={_id}>
		<Td><input type='radio' name="radjo" value={_id}></input></Td>
		<Td>{occurence}</Td>
		<Td>{time}</Td>
		<Td>{wday}</Td>
		<Td>{date}</Td>
		<Td>{label}</Td>
		<Td>{devices}</Td>
		</Tr>
		})
	}
	
	return (
		<Container bg='blue.200' maxW='fit-content'>
			<Heading size='sm'>List of Alarms for {localStorage.getItem('screenname')}</Heading>
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
			</TableContainer><Button size='sm' margin="3px" colorScheme='blue'>Add alarm</Button> <Button size='sm' margin="3px" onClick={onEdit}>Edit alarm</Button> <Button size='sm' margin="3px" colorScheme="red">Delete alarm</Button> 
		</Container>
	)
}

export default Alarms;