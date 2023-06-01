import React, { useState } from 'react';
import { useLogIn, usePopups } from '../stores';
import { Button, Modal, ModalBody, ModalContent, Input,
     Text, ModalFooter, ModalHeader, Spacer, 
      ModalCloseButton, ModalOverlay} from '@chakra-ui/react';

function PasswordReset() {
    const setShowPasswordForgot = usePopups((state) => state.setShowPasswordForgot)
    const showPasswordForgot = usePopups((state) => state.showPasswordForgot)
    const forgotPassword = useLogIn((state) => state.forgotPassword)
    const [email, setEmail] = useState('')
    return (
        <Modal
            isOpen={showPasswordForgot}
            onClose={() => setShowPasswordForgot(false)}
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
                        Enter your email address to reset your password.
                    </Text>
                    <Input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme='blue'
                        onClick={() => setShowPasswordForgot(false)}
                    >
                        Cancel
                    </Button>
                    <Spacer/>
                    <Button
                        colorScheme='green'
                        onClick={() => {
                            setShowPasswordForgot(false)
                            forgotPassword(email)
                        }}
                    >
                        Reset
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default PasswordReset