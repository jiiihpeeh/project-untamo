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

// Option for Profile picture? (not necessary)

function EditProfile() {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()

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
			  <input id="name" placeholder='Type here...' />
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