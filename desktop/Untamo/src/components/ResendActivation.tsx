import React, { useState } from 'react';
import { useLogIn, usePopups } from '../stores';
import { Button, Modal, ModalBody, ModalContent, Input,
     Text, ModalFooter, ModalHeader, Spacer, 
      ModalCloseButton, ModalOverlay} from '@chakra-ui/react';

function ResendActivation() {
    const setShowResendActivation = usePopups((state) => state.setShowResendActivation)
    const showResendActivation = usePopups((state) => state.showResendActivation)
    const sendActivation = useLogIn((state) => state.resendActivation)
    const [email, setEmail] = useState('')
    return (<>
        <Modal
            isOpen={showResendActivation}
            onClose={() => setShowResendActivation(false)}
            isCentered
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Reset Password
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>
                        Enter your email address to send a new activation code.
                    </Text>
                    <Input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme='blue'
                        onClick={() => setShowResendActivation(false)}
                    >
                        Cancel
                    </Button>
                    <Spacer/>
                    <Button
                        colorScheme='green'
                        onClick={() => {
                            setShowResendActivation(false)
                            sendActivation(email)
                        }}
                    >
                        Send
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>)
}

export default ResendActivation