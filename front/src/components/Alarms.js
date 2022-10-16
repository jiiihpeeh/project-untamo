import React, { useContext, useEffect } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import { useNavigate } from "react-router-dom";
import { Container, SimpleGrid, Text, Box, Button, Heading} from '@chakra-ui/react';
import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
  } from '@chakra-ui/react'


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


	return (
	
	<Container bg='blue.200' maxW='1000px'>
	<Heading size='sm'>List of Alarms for {localStorage.getItem('screenname')}</Heading>
	<TableContainer>
	<Table variant='striped' colorScheme='teal' size='sm' id='gable'>
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
    <Tbody>
{/* TEMPORARY */}
		<Tr>
		<Td>523</Td>
        <Td>Once</Td>
        <Td isNumeric>15:23</Td>
		<Td>Wednesday</Td>
		<Td>14.12.2022</Td>
		<Td>Testings</Td>
		<Td>Browser, Mobile</Td>
		<Td><Button size='xs'>Edit</Button></Td>
		<Td><Button colorScheme='red' size='xs'>Delete</Button></Td>
		</Tr>

		<Tr>
		<Td>132</Td>
        <Td>Daily</Td>
        <Td isNumeric>09:00</Td>
		<Td></Td>
		<Td></Td>
		<Td>Wake up</Td>
		<Td>IoT-Clock, Mobile</Td>
		<Td><Button size='xs'>Edit</Button></Td>
		<Td><Button colorScheme='red' size='xs'>Delete</Button></Td>
		</Tr>

		<Tr>
		<Td>24</Td>
        <Td>Weekly</Td>
        <Td isNumeric>16:00</Td>
		<Td>Friday</Td>
		<Td></Td>
		<Td>Alko</Td>
		<Td>Browser, Mobile</Td>
		<Td><Button size='xs'>Edit</Button></Td>
		<Td><Button colorScheme='red' size='xs'>Delete</Button></Td>
		</Tr>

    </Tbody>
	</Table>
</TableContainer><Button size='sm' margin="3px">Add alarm</Button>
		</Container>
	
	)
}

export default Alarms;