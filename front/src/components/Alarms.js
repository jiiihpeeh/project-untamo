import React, { useContext, useEffect } from "react";
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
	FormControl,
	Radio
	} from '@chakra-ui/react'
import EditAlarm from "./EditAlarm";
import AddAlarm from "./AddAlarm";
import DeleteAlarm from "./DeleteAlarm";
import { notification } from './notification';
import axios from 'axios';
import { AlarmContext } from '../contexts/AlarmContext';

const Alarms = () => {
	const { sessionStatus, token, userInfo } = useContext(SessionContext);
	const navigate = useNavigate();
	const { devices, viewableDevices, currentDevice } = useContext(DeviceContext);

	const {alarms, setAlarms} = useContext(AlarmContext);
	const renderAlarms = () => {
		let viewableAlarmsSet = new Set ();
		for(const filtrate of viewableDevices){
			for(const secondFiltrate of alarms.filter(alarm => alarm.device_ids.includes(filtrate))){
				viewableAlarmsSet.add(secondFiltrate);
			};
		};
		let viewableAlarms = [...viewableAlarmsSet];
		return viewableAlarms.map(({ _id, occurence, time, wday, date, label, device_ids, active },key) => {
               return (
					<>
					<Tr key={_id}>
						<Td>{occurence}</Td>
						<Td>{time}</Td>
						<Td>{wday}</Td>
						<Td>{date}</Td>
						<Td>{label}</Td>
						<Td>{mapDeviceIDsToNames(device_ids)}</Td>
						<Td>
						<FormControl display='flex' 
									alignItems='center'
						>
							<Switch name={`alarm-switch-${alarms[key]._id}`}
									id={`alarm-active-${alarms[key]._id}`}
									isChecked={active}
									size='md' 
									onChange={() => activityChange(alarms[key])}
							/>
						</FormControl>
					</Td>
				</Tr>
				</>
         )})
    }

	const mapDeviceIDsToNames = (device_ids) =>{
		let filteredDevices = devices.filter(device => device_ids.includes(device.id));
		let filteredDeviceNames = [];
		for(const dev of filteredDevices){
			filteredDeviceNames.push(dev.deviceName);
		}
		return filteredDeviceNames.join(", ");
	}
	const activityChange = async (alarm) => {
		try {
			console.log("Try: /api/alarm/"+alarm._id,alarm)
			alarm.active = !alarm.active
			const res = await axios.put('/api/alarm/'+alarm._id,alarm, {headers: {token: token}} );
			console.log(res.data);
			notification("Edit Alarm", "Alarm modified")
			let filteredAlarms = alarms.filter(alarmItem => alarmItem._id !== alarm._id)
			filteredAlarms.push(alarm)
			localStorage.setItem('alarms', JSON.stringify(filteredAlarms));
			setAlarms(filteredAlarms)
		} catch (err){
			console.error(err)
			notification("Edit Alarm", "Alarm edit save failed", "error")
		}
	}


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
	return (<>
		<Container bg='blue.200' maxW='fit-content'>
			<Heading size='sm'>List of Alarms for {userInfo.screenname}. </Heading>
			<TableContainer>
				<Table variant='striped' colorScheme='teal' size='sm' className="table-tiny" id='tabell'>
					<Thead>
						<Tr>
							<Th>Occurence</Th>
							<Th isNumeric>Time</Th>
							<Th>Weekday</Th>
							<Th>date</Th>
							<Th>Label</Th>
							<Th>Devices</Th>
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

			
		</Container>

		<AddAlarm/>
	</>)
}

export default Alarms;