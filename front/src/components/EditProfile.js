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
	Input,
	Checkbox,
	Box,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	} from '@chakra-ui/react'
import React from 'react';
import { useState, useEffect, useContext } from 'react'
import { SessionContext } from "../contexts/SessionContext";
import axios from 'axios';
import { notification } from './notification';

import '../App.css'
// Option for Profile picture? (not necessary)

function EditProfile() {

	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()

    const { userInfo, setUserInfo, token, server } = useContext(SessionContext);

    const [formData, setFormData] = useState({
												firstname: '',
												lastname:'',
												user: '',
												screenname: '',
												current_password: '',
												change_password: '',
												confirm_password:''});

	const [ changePassword, setChangePassword ] = useState(false);
	const [ formChecks, setFormChecks ] = useState(true);

	const onChange = (event) => {
		setFormData((formData) => {
			return {
				...formData,
				[event.target.name] : event.target.value
			};
		})
	}

	const onRegister = async (event) => {
		console.log("onRegister triggered");
		let reqFormData = Object.assign({}, formData);
		delete reqFormData.confirm_password;
		if(!changePassword){
			delete reqFormData.change_password;
		}
		try {
			const res = await axios.put(`${server}/api/editUser/`+formData.user,reqFormData , {headers:{ token: token }});
			console.log(res.data);
			notification("Edit Profile", "User information succesfully modified");
			setUserInfo({ firstname : formData.firstname, lastname: formData.lastname, user: formData.user, screenname: formData.screenname })
			localStorage['userInfo'] = JSON.stringify( {firstname : formData.firstname, lastname: formData.lastname, user: formData.user, screenname: formData.screenname });
			
		} catch (err){
			console.error(err.response.data.message);
			notification("Edit Profile", `Profile save failed: ${err.response.data.message}`, "error");
		}
	}

	const onCloseFixed = () => {
		  setChangePassword(false);
		  setFormData({ firstname: '',
			          lastname: '',
			           user: '',
			          screenname: '',
			          current_password: '',
			          change_password: '',
			          confirm_password:''})
		onClose();
	}
	const drawerOpen = () => {
		console.log(userInfo)
		setFormData({firstname: userInfo.firstname,
			lastname: userInfo.lastname,
			user: userInfo.user,
			screenname: userInfo.screenname,
			current_password: '',
			change_password: '',
			confirm_password:''})
		onOpen();
	}
	useEffect(() => {
		const passwordChecker = () => {
			if(formData && formData.current_password && formData.current_password.length < 6){
				setFormChecks(false);
				return;
			}
			if(changePassword){
				if (formData.change_password.length > 5 && 
					(formData.change_password === formData.confirm_password) && 
					(formData.change_password !== formData.current_password)){
					setFormChecks(true);
					return;
				}else{
					setFormChecks(false);
					return;
				}
			}else{
				setFormChecks(true);
				return;
			}
		}
		passwordChecker()
	},[formData,changePassword])


	return (
		<>
		<Link onClick={drawerOpen}>
			<Text as='b'>
				Edit Profile
			</Text>
		</Link>
		<Drawer
			isOpen={isOpen}
			placement='right'
			onClose={onCloseFixed}
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
				<FormLabel htmlFor="screenname">Profile name</FormLabel>
				<Input name='screenname' 
					   id ='edit-screenname' 
					   onChange={onChange}
					   placeholder={formData.screenname}
					   value={formData.screenname} />

				<FormLabel htmlFor="firstname">First Name</FormLabel>
				<Input name='firstname'
						id ='edit-firstname' 
					    onChange={onChange} 
					    value={formData.firstname} />
			
				<FormLabel htmlFor="lastname">Last Name</FormLabel>
				<Input name='lastname'
					   id ='edit-lastname'
					   onChange={onChange} 
					   value={formData.lastname} />

				<FormLabel htmlFor="user">E-mail</FormLabel>
				<Input name='user'
					   id ='edit-user' 
					   onChange={onChange} 
					   value={formData.user}
					   type="email" />

				<FormLabel htmlFor="current_password">Current Password</FormLabel>
				<Input name='current_password' 
					   onChange={onChange}
					   id ='edit-currentpassword'
					   value={formData.current_password}
					   type="password" />
				<Accordion allowToggle={true} onChange={() => {setChangePassword(!changePassword)}}>
					<AccordionItem>
						<h2>
						<AccordionButton>
							<Box flex='1' textAlign='left' >
								Change Password
							</Box>
							<Checkbox isChecked={changePassword}  
									  colorScheme='green'
									/>
						</AccordionButton>
						</h2>
						<AccordionPanel pb={4}>
							<FormLabel htmlFor="change_password">
								New Password
							</FormLabel>
							<Input name='change_password'
								id="edit-newpassword" 
								onChange={onChange}
								value={formData.change_password}
								type="password" />

							<FormLabel htmlFor="confirm_password">Confirm new Password</FormLabel>
							<Input name='confirm_password'
									id="edit-confirmpassword"
								   onChange={onChange}
								   value={formData.confirm_password}
								   type="password" />
						</AccordionPanel>
					</AccordionItem>
				</Accordion>
			
			</FormControl>
			</form>

			</DrawerBody>
			<DrawerFooter>
				<Button variant='outline' mr={3} 
						onClick={onCloseFixed} 
						colorScheme="red"
					>
						Cancel
				</Button>
				<Button colorScheme='green' 
						onClick={onRegister} 
						isDisabled={!formChecks}
					>Save</Button>
			</DrawerFooter>
		</DrawerContent>
		</Drawer>
	</>
	)
};

export default EditProfile;