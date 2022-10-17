import {
	useDisclosure,
	Text,
	Link,
	Button,
	Drawer,
	DrawerBody,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
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
import {
	Table,
	Tbody,
	Tr,
	Td,
	TableContainer,
	} from '@chakra-ui/react'
import { notification } from './notification';


function DeleteAlarm() {
	var [Selected_alarm, setSelected_alarm] = useState({
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
	
	const onChange = (event) => {
		console.log(event.target.name+":"+event.target.value)
		setSelected_alarm((Selected_alarm) => {
			return {
				...Selected_alarm,
				[event.target.name] : event.target.value
			};
		})
	}
	
	const onRegister = async (event) => {
		try {
			console.log("Try: /api/editAlarm/"+Selected_alarm._id,Selected_alarm)
			
			const res = await axios.put('/api/editAlarm/'+Selected_alarm._id,Selected_alarm );
			console.log(res.data);
			notification("Edit Alarm", "Alarm succesfully modified")
		} catch (err){
			console.error(err)
			notification("Edit Alarm", "Alarm edit save failed", "error")
			
		}
	}
	
	const deleteAlarm = async() =>{
        try {
			/*
            let res = await axios.post('http://localhost:3001/logout', {msg: "smell you later"}, {
                headers: {'token': token}
            });
			*/
            //console.log(res.data);
            
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

/*

		<>
		<Link onClick={onOpen}><Text as='b'>
		Edit Alarm
		</Text></Link>
		<Drawer
			isOpen={isOpen}
			placement='left'
			onClose={onClose}
			finalFocusRef={btnRef}
			size={'md'}
		>
		<DrawerOverlay />
		<DrawerContent>
			<DrawerCloseButton />
			<DrawerHeader>Edit Alarm</DrawerHeader>
			<DrawerBody>
				<TableContainer>
					<Table variant='striped' colorScheme='teal' size='sm' className="table-editalarm">
					<Tbody> 
						<Tr><Td><label htmlFor="id">ID: </label></Td><Td><input name="id" readOnly value={Selected_alarm._id} size="30"/></Td></Tr>
						<Tr><Td><label htmlFor="occu">Occurence: </label></Td><Td><select id="occu" name="occu" onChange={onChange}><option value={Selected_alarm.occurence}>{Selected_alarm.occurence}</option><option value="once">once</option><option value="weekly">weekly</option><option value="yearly">yearly</option></select></Td></Tr>
						<Tr><Td><label htmlFor="time">Time: </label></Td><Td><input type="time" id="time" name="time" value={Selected_alarm.time} onChange={onChange}/></Td></Tr>
						<Tr><Td><label htmlFor="wday">Weekday: </label></Td><Td><input name="wday" placeholder={Selected_alarm.wday} size="30" onChange={onChange}/></Td></Tr>
						<Tr><Td><label htmlFor="date">Date: </label></Td><Td><input name="date" placeholder={Selected_alarm.date} size="30" onChange={onChange}/></Td></Tr>
						<Tr><Td><label htmlFor="label">Label: </label></Td><Td><input name="label" placeholder={Selected_alarm.label} size="30" onChange={onChange}/></Td></Tr>
						<Tr><Td><label htmlFor="devices">Devices: </label></Td><Td><input name="devices" readOnly placeholder={Selected_alarm.devices} size="30"/></Td></Tr>
					</Tbody>
					</Table>
				</TableContainer>
				</DrawerBody>
				<DrawerFooter>
					<Button variant='outline' mr={3} onClick={onClose} colorScheme="red">Cancel</Button>
					<Button colorScheme='green' onClick={onRegister}>Save</Button>
				</DrawerFooter>
			</DrawerContent>
			</Drawer>
		</>

*/
