import {
	useDisclosure,
	Text,
	Link,
	Button,
	AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useRef, useContext } from 'react'
import axios from 'axios';
import { notification } from './notification';
import { AlarmContext } from '../contexts/AlarmContext';

function DeleteAlarm(props) {
	let valittu=JSON.parse(props.valinta)
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const cancelRef = useRef();
	let alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms] = useState(alarmlist)
	let radios = document.getElementsByName('radjo');
	const { setAlarms } = useContext(AlarmContext);

	const deleteAlarm = async() =>{
        try {
			//Delete selected alarm id from mongodb
			const res = await axios.delete('/api/alarm/'+valittu._id);
			console.log("res.data:"+JSON.stringify(res.data));
			//Delete selected alarm id from localstorage
			let oldAlarms=JSON.parse(localStorage.getItem('alarms')) || [];
			for (let i =0; i< oldAlarms.length; i++) {
				if (oldAlarms[i]._id === valittu._id) {
					oldAlarms.splice([i], 1);
					localStorage.setItem('alarms',JSON.stringify(oldAlarms))
					props.updateAlarms(oldAlarms)
					setAlarms(oldAlarms);
					console.log("ALARM DELETED")
					props.updateNapit('hide')
				}
			}
        }catch(err){
            notification("Delete alarm", "Delete alarm failed", 'error');
            console.log("Delete alarm failed");
        };
    }

	return (
		<>
		<Link onClick={onOpen}><Text as='b'>
			Delete Alarm
		</Text></Link>
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize='lg' fontWeight='bold'>
						Delete alarm: {valittu.label}
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