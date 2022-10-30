import React, { useContext, useEffect, useState } from "react";
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
	Center,
	Text,
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
	const { alarms } = useContext(AlarmContext);


	const alarmRowFormat = (alarm) => {
		switch (alarm.occurence){
			// ['radio', 'time', 'weekday', 'date', 'label', 'devices', 'active']
			case 'daily':
				return ['radio', 'occurence', 'time', 'null', 'null', 'label', 'devices', 'active'];
			case 'weekly':
				return ['radio', 'occurence','time', 'weekday', 'null', 'label', 'devices', 'active'];
			case 'yearly':
				return ['radio', 'occurence','time', 'null', 'date', 'label', 'devices', 'active'];
			case 'once':
				return ['radio', 'occurence','time', 'null', 'date', 'label', 'devices', 'active'];
            default:
                break;
		};
	};

	const AlarmRow = (alarm) => {
        let alarmArr = []
        for (const item of alarmRowFormat(alarm)){
            switch (item){
                case 'radio':
                    alarmArr.push(<Td><Radio/></Td>);
                    break;
                case 'occurence':
                    alarmArr.push(<Td>{alarm.occurence}</Td>);
                    break;
                case 'time':
                    alarmArr.push(<Td>{alarm.time}</Td>);
                    break;
                case 'weekday':
                    alarmArr.push(<Td>{alarm.wday.join(", ")}</Td>);
                    break;
                case 'date':
                    alarmArr.push(<Td>{alarm.date}</Td>);
                    break;
                case 'label':
                    alarmArr.push(<Td>{alarm.label}</Td>);
                    break;
                case 'devices':
                    alarmArr.push(<Td>{alarm.devices.join(", ")}</Td>);
                    break;
                case 'active':
                    alarmArr.push(<Td><Switch/></Td>);
                    break;
                case 'null':
                    alarmArr.push(<Td></Td>);
                    break;
                default:
                    break;
            }
        }
        return (<Tr>{alarmArr}</Tr>);
	}
    const AlarmRows = () => {
        let alarmRows = [];
        for(const alarm of alarms){
            alarmRows.push(AlarmRow(alarm));
        }
        return (
            {alarmRows}
            )
    }
	// let radio_buttons = document.getElementsByName('radjo');
	// let alarmlist = JSON.parse(localStorage['alarms'])
	// const [alarms, setClarms] = useState(alarms)
	// const renderAlarms = () => {
	// 	let activerow
	// 	let checkboxesChecked = [];
	
	// 	return alarms.map(({ _id, occurence, time, wday, date, label, devices, active },numero) => {
	// 		if(alarms[numero].active===1){
	// 			checkboxesChecked.push(alarms[numero].value);
	// 			activerow=<Td><FormControl display='flex' alignItems='center'>
	// 			<Switch name='swjtch' id='alarm-active' defaultChecked value={JSON.stringify(alarms[numero])} size='md' onChange={(e) => activityChange(alarms[numero], e)}/>
	// 			</FormControl></Td>
	// 		} else if(alarms[numero].active===0){
	// 			activerow=<Td><FormControl display='flex' alignItems='center'>
	// 			<Switch name='swjtch' id='alarm-active'  value={JSON.stringify(alarms[numero])} size='md' onChange={(e) => activityChange(alarms[numero], e)}/>
	// 			</FormControl></Td>
	// 		}
	// 	return <Tr key={_id}>
	// 			<Td><input type='radio' name="radjo" value={JSON.stringify(alarms[numero])} onClick={bottunClick}/></Td>
	// 			<Td>{occurence}</Td>
	// 			<Td>{time}</Td>
	// 			<Td>{wday}</Td>
	// 			<Td>{date}</Td>
	// 			<Td>{label}</Td>
	// 			<Td>{devices}</Td>
	// 			{activerow}
	// 			</Tr>
	// 	})
	// }
    // co
	// const activityChange = async (props) => {
	// 	if(props.active===1){props.active=0}
	// 	else if(props.active===0){props.active=1}
	// 	try {
	// 		console.log("Try: /api/alarm/"+props._id,props)
	// 		const res = await axios.put('/api/alarm/'+props._id,props );
	// 		console.log(res.data);
	// 		notification("Edit Alarm", "Alarm succesfully modified")
	// 		let oldAlarms=JSON.parse(localStorage.getItem('alarms')) || [];
	// 		for (let i = 0; i < oldAlarms.length; i++) {
	// 			if(oldAlarms[i]._id===props._id) {
	// 				oldAlarms.splice(i,1)
	// 			}
	// 		}
	// 		oldAlarms.push(props)
	// 		localStorage.setItem('alarms', JSON.stringify(oldAlarms));
	// 		setAlarms(oldAlarms)
	// 	} catch (err){
	// 		console.error(err)
	// 		notification("Edit Alarm", "Alarm edit save failed", "error")
	// 	}
	// }

	// const updateAlarms = (alarmsChild) => setClarms(alarmsChild)
	// const updateNapit = (nappiChild) => setMod_nappi_tila(nappiChild)
	// let edit_nappi_hide=<Text>Edit Alarm</Text>
	// let edit_nappi_show=<EditAlarm updateAlarms={updateAlarms} valinta={alarm_valinta} updateNapit={updateNapit}/>
	// let delete_nappi_hide=<Text>Delete Alarm</Text>
	// let delete_nappi_show=<DeleteAlarm updateAlarms={updateAlarms} valinta={alarm_valinta} updateNapit={updateNapit}/>

	// if(mod_nappi_tila==='hide'){
	// 	edit_nappi=edit_nappi_hide
	// 	delete_nappi=delete_nappi_hide
	// }
	// if(mod_nappi_tila==='show'){
	// 	edit_nappi=edit_nappi_show
	// 	delete_nappi=delete_nappi_show
	// }

	// const bottunClick = () => {
	// 	let valittu_alarm=''
	// 	for (let i = 0, length = radio_buttons.length; i < length; i++) {
	// 		if (radio_buttons[i].checked) {
	// 			valittu_alarm = radio_buttons[i].value
	// 			setAlarm_valinta(valittu_alarm)
	// 			setMod_nappi_tila('show')
	// 		}
	// 	}
	// }
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
	return (
		<Container bg='blue.200' maxW='fit-content'>
			{/* <Heading size='sm'>List of Alarms for {localStorage.getItem('screenname')} {ealarm.label}</Heading> */}
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
							<Th>Active</Th>
						</Tr>
					</Thead>
				<Tbody> 
					<AlarmRows/> 
				</Tbody>
				</Table>
			</TableContainer>
			{/* <Center> */}
			{/* <HStack spacing='30px'> */}
			{/* <AddAlarm updateAlarms={updateAlarms}/>{edit_nappi}{delete_nappi}</HStack></Center> */}
		</Container>
	)
}

export default Alarms;