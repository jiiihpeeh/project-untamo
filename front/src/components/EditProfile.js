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
	FormLabel,
	FormControl,
	Input
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useEffect, useContext } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import { notification } from './notification';

// Option for Profile picture? (not necessary)

function EditProfile() {

	let toukeni = localStorage.getItem("token");
    axios.defaults.headers.common['token'] = toukeni;

	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()

    const { userInfo, setUserInfo } = useContext(SessionContext);

    const [formData, setFormData] = useState({
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
        user: userInfo.user,
		screenname: userInfo.screenname,
    });


const onChange = (event) => {
	setFormData((formData) => {
		return {
			...formData,
			[event.target.name] : event.target.value
		};
	})
}

const onRegister = async (event) => {
	console.log("onRegister triggered")
	try {
		const res = await axios.put('/api/editUser/'+formData.user,formData );
		console.log(res.data);
		notification("Edit Profile", "User information succesfully modified")
		//navigate('/login')
	} catch (err){
		console.error(err)
		notification("Edit Profile", "Profile save failed", "error")
	}
}

	return (
		<>
		<Link onClick={onOpen}><Text as='b'>
		Edit Profile
		</Text></Link>
		<Drawer
			isOpen={isOpen}
			placement='right'
			onClose={onClose}
			finalFocusRef={btnRef}
		>
		<DrawerOverlay />
		<DrawerContent>
			<DrawerCloseButton />
			<DrawerHeader>Edit profile</DrawerHeader>
			<DrawerBody>
			<form 
				id='edit-profile-form'
				onSubmit={onRegister}
            >
			<FormControl>
				<FormLabel htmlFor="firstname">First Name</FormLabel>
				<Input name='firstname' onChange={onChange} placeholder={formData.firstname} />
			
				<FormLabel htmlFor="lastname">Last Name</FormLabel>
				<Input name='lastname' onChange={onChange} placeholder={formData.lastname} />

				<FormLabel htmlFor="screenname">Profile name</FormLabel>
				<Input name='screenname' onChange={onChange} placeholder={formData.screenname} />

				<FormLabel htmlFor="user">E-mail</FormLabel>
				<Input name='user' onChange={onChange} placeholder={formData.user} />
			
			</FormControl>
            
			</form>
			</DrawerBody>
			<DrawerFooter>
				<Button variant='outline' mr={3} onClick={onClose} colorScheme="red">
					Cancel
				</Button>
				<Button colorScheme='green' onClick={onRegister}>Save</Button>
			</DrawerFooter>
		</DrawerContent>
		</Drawer>
	</>
	)
}

export default EditProfile;