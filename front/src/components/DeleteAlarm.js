import {
	useDisclosure,
	Text,
	Link,
	Button,
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useContext, useRef } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
  } from '@chakra-ui/react';
import { notification } from './notification';

function DeleteAlarm(props) {
	let [Selected_alarm] = useState({
		_id: 0,
		occurence: 0,
		time: 0,
		wday: 0,
		date: 0,
		label: 0,
		devices: 0
	});
	var checked_radio
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()
	const cancelRef = useRef();
	const { userInfo, setUserInfo } = useContext(SessionContext);
	var alarmlist = JSON.parse(localStorage['alarms'])
	const [alarms] = useState(alarmlist)
	var radios = document.getElementsByName('radjo');
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked) {
			checked_radio=radios[i].value
			Selected_alarm = alarms[i]
		}
	}

	const deleteAlarm = async(event) =>{
        try {
			//Delete Selected_alarm._id from mongodb
			const res = await axios.delete('/api/alarm/'+Selected_alarm._id);
			console.log("res.data:"+JSON.stringify(res.data));
			console.log(res.data.id)
			//Delete Selected_alarm._id from localstorage
			var oldAlarms=JSON.parse(localStorage.getItem('alarms')) || [];
			for (var i =0; i< oldAlarms.length; i++) {
				if (oldAlarms[i]._id == Selected_alarm._id) {
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
						Delete alarm?
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