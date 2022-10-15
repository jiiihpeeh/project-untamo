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
	const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);
	const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
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

	const renderAlarms = () => {
		return alarms.map(({ _id, occurence, time, wday, date, label, devices }) => {
		return <Tr key={_id}>
		<Td>{_id}</Td>
		<Td>{occurence}</Td>
		<Td>{time}</Td>
		<Td>{wday}</Td>
		<Td>{date}</Td>
		<Td>{label}</Td>
		<Td>{devices}</Td>
		<Td><Button size='xs'>Edit</Button></Td>
		<Td><Button colorScheme='red' size='xs'>Delete</Button></Td>
		</Tr>
		})
	}


	return (
		<Container bg='blue.200' maxW='fit-content'>
			<Heading size='sm'>List of Alarms for {localStorage.getItem('screenname')}</Heading>
			<TableContainer>
				<Table variant='striped' colorScheme='teal' size='sm' className="table-tiny">
					<Thead>
						<Tr>
							<Th>ID</Th>
							<Th>Occurence</Th>
							<Th isNumeric>Time</Th>
							<Th>Weekday</Th>
							<Th>date</Th>
							<Th>Label</Th>
							<Th>Devices</Th>
							<Th></Th>
							<Th></Th>
						</Tr>
					</Thead>
				<Tbody id="grable"> 
					{renderAlarms()} 
				</Tbody>
				</Table>
			</TableContainer><Button size='sm' margin="3px">Add alarm</Button> 
		</Container>
	)
}

export default Alarms;