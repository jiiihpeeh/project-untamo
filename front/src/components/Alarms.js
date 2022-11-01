import React, { useContext, useEffect } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import { useNavigate } from "react-router-dom";
import {
	Container,Heading,Table,Thead,Tbody,
	Tr,Th,Td,TableContainer,
	Center,Switch
	} from '@chakra-ui/react'
import EditAlarm from "./EditAlarm";
import AddAlarm from "./AddAlarm";
import DeleteAlarm from "./DeleteAlarm";
import { notification } from './notification';
import axios from 'axios';
import { AlarmContext } from '../contexts/AlarmContext';
import { dayContinuationDays } from "./calcAlarmTime";
import AlarmNotification from "./AlarmNotification";
import { timeForNextAlarm } from "./calcAlarmTime";

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
		let timeAlarmMap = new Map();
		for(const item of viewableAlarms){
			let timeStamp = timeForNextAlarm(item).getTime();
			timeAlarmMap.set(timeStamp, timeAlarmMap.get(timeStamp)? timeAlarmMap.get(timeStamp).push(item._id): [item._id] );
		}
		let timeMapArray = [...timeAlarmMap.keys()].sort(function(a, b){return a - b});
		let sortedView = [];
		for(const item of timeMapArray){
			for (const subitem of timeAlarmMap.get(item)){
				sortedView.push(viewableAlarms.filter(alarm => alarm._id === subitem)[0]);
			} 
			
		}
		return sortedView.map(({ _id, occurence, time, wday, date, label, device_ids, active },key) => {
			return (
					<>
					<Tr key={_id}>
						<Td>{occurence}</Td>
						<Td>{time}</Td>
						<Td>{weekdayDisplay(wday)}</Td>
						<Td>{date}</Td>
						<Td>{label}</Td>
						<Td>{mapDeviceIDsToNames(device_ids)}</Td>
						<Td>
							<Center>
								<Switch 
										name={`alarm-switch-${alarms[key]._id}`}
										id={`alarm-active-${alarms[key]._id}`}
										isChecked={active}
										size='md' 
										onChange={() => activityChange(_id)}
								/>
							</Center>
						</Td>
						<Td>
							<EditAlarm id={_id} />
						</Td>
						<Td>
							<DeleteAlarm id={_id}/>
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
	const activityChange = async (id) => {
		try {
			let alarmArr = alarms.filter(alarm => alarm._id === id);
			if(alarmArr.length !== 1){
				throw new Error('Alarm ids are problematic!');
			}
			let alarm = alarmArr[0];
			console.log("Try: /api/alarm/"+alarm._id,alarm);
			alarm.active = !alarm.active;
			const res = await axios.put('/api/alarm/'+alarm._id,alarm, {headers: {token: token}} );
			console.log(res.data);
			notification("Edit Alarm", "Alarm modified");
			let filteredAlarms = alarms.filter(alarmItem => alarmItem._id !== alarm._id);
			filteredAlarms.push(alarm);
			localStorage.setItem('alarms', JSON.stringify(filteredAlarms));
			setAlarms(filteredAlarms);
		} catch (err){
			console.error(err);
			notification("Edit Alarm", "Alarm edit save failed", "error");
		}
	}

	const weekdayDisplay = (days) => {
		let dayArr = dayContinuationDays(days);
		let subList = [];
		for(const outer of dayArr){
			subList.push(outer.join('-'));
		}
		return subList.join(', ');
	}

	useEffect(() =>{
		if(!sessionStatus){
			navigate('/login');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[sessionStatus])

	useEffect(() =>{
		if(!currentDevice){
			navigate('/welcome');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[currentDevice])
	return (<>
		<Container bg='blue.200' maxW='fit-content'>

			<Heading size='sm'>List of Alarms for selected devices for user {userInfo.screenname}. Currently on {mapDeviceIDsToNames([currentDevice])}. </Heading>
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
		<AlarmNotification/>
	</>)
}

export default Alarms;