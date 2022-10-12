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
import { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext";



// Option for Profile picture? (not necessary)

function EditProfile() {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()

    const { userInfo, setUserInfo } = useContext(SessionContext);

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
				onSubmit={(e) => {
                e.preventDefault()
                console.log('submitted')
				}}
            >

			<p>
				<label htmlFor="firstname">First Name</label></p><p>
				<input name='firstname' placeholder={userInfo.firstname} />
			</p>

			<p>
				<label htmlFor="lastname">Last Name</label></p><p>
				<input name='lastname' placeholder={userInfo.lastname} />
			</p>
			
			<p>
				<label htmlFor="email">E-mail</label></p><p>
				<input name='email' placeholder={userInfo.user} />
			</p>

            
			</form>
			</DrawerBody>
			<DrawerFooter>
				<Button variant='outline' mr={3} onClick={onClose} colorScheme="red">
					Cancel
				</Button>
				<Button colorScheme='green'>Save</Button>
			</DrawerFooter>
		</DrawerContent>
		</Drawer>
	</>
	)
}

export default EditProfile;