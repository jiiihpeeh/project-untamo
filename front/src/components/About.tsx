import {
	Modal,ModalOverlay,
	ModalContent,ModalHeader,
	ModalFooter, ModalBody,
	ModalCloseButton, 
	Text ,Button
  } from '@chakra-ui/react'
import React from 'react'
import { usePopups } from '../stores'
const About = () => {
	const setShowAbout = usePopups((state)=> state.setShowAbout)
	const showAbout = usePopups((state)=> state.showAbout)
	return (<>
		<Modal 
			isOpen={showAbout} 
			onClose={()=>setShowAbout(false)}
		>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					About
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
				<Text>
					This project aims to implement s cross device alarm clock implementation with synchronization.
				</Text>
				</ModalBody>

				<ModalFooter>
				<Button 
					colorScheme='blue' 
					mr={3} 
					onClick={()=>setShowAbout(false)}
				>
					OK
				</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	</>)
}

export default About