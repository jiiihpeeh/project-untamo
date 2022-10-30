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
	const { currentDevice } = useContext(DeviceContext);
    const navigate = useNavigate();
	const { devices, viewableDevices } = useContext(DeviceContext);

	const {alarms, setAlarms} = useContext(AlarmContext);
	const renderAlarms = () => {
        return alarms.map(({ _id, occurence, time, wday, date, label, device_ids, active },key) => {
               return (
               <>
                <Tr key={_id}>
                    <Td>{occurence}</Td>
                    <Td>{time}</Td>
                    <Td>{wday}</Td>
                    <Td>{date}</Td>
                    <Td>{label}</Td>
                    <Td>{mapIDsToNames(device_ids)}</Td>
                    <Td>
                        <FormControl display='flex' 
                                     alignItems='center'
                        >
                            <Switch name={`alarm-switch-${alarms[key]._id}`}
                                    id={`alarm-active-${alarms[key]._id}`}
                                    isChecked={isAlarmActive(alarms[key])}
                                    size='md' 
                                    onChange={() => activityChange(alarms[key])}
                            />
                        </FormControl>
                    </Td>
                </Tr>
                </>
         )})
    }
	const isAlarmActive = (id) => {
		let alarmObject = alarms.filter(alarm => alarm._id === id);
		if (alarmObject && alarmObject.length === 1 ){
			console.log(id,  alarmObject[0].active)
			return alarmObject[0].active; 
		}
		return false;
	}
	const mapIDsToNames = (device_ids) =>{
		return "Juu-u"
	}
	const activityChange = async (props) => {
		if(props.active===1){props.active=0}
		else if(props.active===0){props.active=1}
		try {
			console.log("Try: /api/alarm/"+props._id,props)
			const res = await axios.put('/api/alarm/'+props._id,props, {headers: {token: token}} );
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
			<Heading size='sm'>List of Alarms for {userInfo.screenname} </Heading>
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