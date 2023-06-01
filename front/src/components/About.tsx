import { Modal,ModalOverlay, ModalContent,ModalHeader,ModalCloseButton,
         ModalFooter, ModalBody,  Text ,Button } from '@chakra-ui/react'
import React from 'react'
import { usePopups } from '../stores'
function About() {
    const setShowAbout = usePopups((state) => state.setShowAbout)
    const showAbout = usePopups((state) => state.showAbout)
    return (
        <Modal
            isOpen={showAbout}
            onClose={() => setShowAbout(false)}
            isCentered
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    About Untamo
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>
                        This project aims to implement a cross device alarm clock with synchronization capabilities.
                    </Text>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme='blue'
                        mr={3}
                        onClick={() => setShowAbout(false)}
                    >
                        OK
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default About