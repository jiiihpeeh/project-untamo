import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
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


function EditProfile() {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = React.useRef()

	return (
		<>
		<Button ref={btnRef} colorScheme='teal' onClick={onOpen}>
		Edit Profile
		</Button>
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

/*
const About = () => {
	const { isOpen, onOpen, onClose } = useDisclosure()	
	return (<>
		<Link onClick={onOpen}><Text as='b'>Edit Profile</Text></Link>
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>About</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
				<Text>This project aimsgrdgrdrg to implement a syncronizable cross device alarm clock implementation.  </Text>
				</ModalBody>

				<ModalFooter>
				<Button colorScheme='blue' mr={3} onClick={onClose}>
					OK
				</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	</>)
}
*/
export default EditProfile;