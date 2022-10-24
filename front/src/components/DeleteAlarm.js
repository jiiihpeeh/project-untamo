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
import { useState, useRef } from 'react'
import axios from 'axios';
import { notification } from './notification';

function DeleteAlarm(props) {
	let [Selected_alarm] = useState({
	});
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const cancelRef = useRef();
	let alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms] = useState(alarmlist)
	let radios = document.getElementsByName('radjo');
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked) {
			Selected_alarm = alarms[i]
		}
	}

	const deleteAlarm = async() =>{
        try {
			//Delete Selected_alarm._id from mongodb
			const res = await axios.delete('/api/alarm/'+Selected_alarm._id);
			console.log("res.data:"+JSON.stringify(res.data));
			//Delete Selected_alarm._id from localstorage
			var oldAlarms=JSON.parse(localStorage.getItem('alarms')) || [];
			for (var i =0; i< oldAlarms.length; i++) {
				if (oldAlarms[i]._id === Selected_alarm._id) {
					oldAlarms.splice([i], 1);
					localStorage.setItem('alarms',JSON.stringify(oldAlarms))
					props.updateAlarms(oldAlarms)
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
						Delete alarm: {Selected_alarm.label}
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