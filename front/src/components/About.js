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
	Button
  } from '@chakra-ui/react'


const About = () => {
	const { isOpen, onOpen, onClose } = useDisclosure()	
	return (<>
		<Link onClick={onOpen}><Text as='b'>About</Text></Link>
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>About</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
				<Text>This project aims to implement a syncronizable cross device alarm clock implementation.  </Text>
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

export default About;