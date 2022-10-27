import {
	useDisclosure,
	Link,
	Button,
	AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
	Tooltip,
	IconButton
	} from '@chakra-ui/react'
import React from 'react';
import { DeleteIcon} from '@chakra-ui/icons';
import { useRef, useContext } from 'react'
import axios from 'axios';
import { notification } from './notification';
import { AlarmContext } from '../contexts/AlarmContext';

function DeleteAlarm(props) {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const cancelRef = useRef();
	let valittu=props.valinta
	let toukeni = localStorage.getItem("token");
	axios.defaults.headers.common['token'] = toukeni;
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
					notification("Delete Alarm", "Alarm succesfully removed")
				}
			}
        }catch(err){
            notification("Delete alarm", "Delete alarm failed", 'error');
            console.log("Delete alarm failed");
			console.error(err)
        };
    }
	return (
		<>
		<Link onClick={onOpen}>
			<Tooltip label='Delete device' fontSize='md'>
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