import {
	useDisclosure,
	Link, Button,
	AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
	Tooltip, IconButton
	} from '@chakra-ui/react'
import React from 'react';
import { DeleteIcon} from '@chakra-ui/icons';
import { useRef, useContext } from 'react'
import axios from 'axios';
import { notification } from './notification';
import { AlarmContext } from '../contexts/AlarmContext';
import { SessionContext } from '../contexts/SessionContext';

function DeleteAlarm(props) {
	const { alarms, setAlarms } = useContext(AlarmContext);
	const { token, server } = useContext(SessionContext);
	const { isOpen, onOpen, onClose } = useDisclosure();	
	let alarm = alarms.filter(alarmItem => alarmItem._id === props.id )[0];
	const cancelRef = useRef();
	

	const deleteAlarm = async() =>{
        try {
			//Delete selected alarm id from mongodb
			const res = await axios.delete(`${server}/api/alarm/`+props.id, {headers:{token:token}});
			console.log(res);
			let filteredAlarms = alarms.filter(alarmItem => alarmItem._id !== props.id);
			setAlarms(filteredAlarms);
			localStorage.setItem('alarms',JSON.stringify(filteredAlarms));
			notification("Delete Alarm", "Alarm succesfully removed");
        }catch(err){
            notification("Delete alarm", "Delete alarm failed", 'error');
            console.log("Delete alarm failed");
			console.error(err);
        };
    }
	return (
		<>
		<Link onClick={onOpen}>
			<Tooltip label='Delete alarm' fontSize='md'>
			<IconButton size='xs' icon={<DeleteIcon/>} ml="5.5%" colorScheme='red'/>
			</Tooltip>
		</Link>
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize='lg' fontWeight='bold'>
						Delete alarm ({alarm.occurence}, {alarm.time} for {alarm.device_ids.length} devices)?
					</AlertDialogHeader>
					<AlertDialogBody>
					Are you sure?
					</AlertDialogBody>
					<AlertDialogFooter>
						<Button ref={cancelRef} onClick={onClose}>
						Cancel
						</Button>
						<Button colorScheme='red' onClick= {() => {deleteAlarm() ; onClose()}} ml={3}>
						OK
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
		</>
		)
	}

export default DeleteAlarm;