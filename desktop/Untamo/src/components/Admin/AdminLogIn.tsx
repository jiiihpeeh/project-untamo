import {  Modal, ModalContent,
          ModalHeader, ModalFooter,
          ModalBody, ModalCloseButton,
          Button, ButtonGroup, 
          FormLabel,Input } from '@chakra-ui/react'
import { FocusLock } from '@chakra-ui/focus-lock'
import React  from 'react'
import { useAdmin, usePopups } from '../../stores'

function AdminLogin() {
  const adminPassword = useAdmin((state) => state.password)
  const setAdminPassword = useAdmin((state) => state.setPassword)
  const adminLogIn = useAdmin((state) => state.logIn)
  const setShowAdminLogIn = usePopups((state) => state.setShowAdminLogIn)
  const showAdminLogIn = usePopups((state) => state.showAdminLogIn)


  async function onLogIn() {
    adminLogIn()
    setShowAdminLogIn(false)
  }

  return (
    <Modal
      returnFocusOnClose={false}
      isOpen={showAdminLogIn}
      onClose={() => setShowAdminLogIn(false)}
      isCentered
    >
      <ModalContent>
        <ModalHeader
          fontWeight='semibold'
        >
          Request admin rights?
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FocusLock
            //returnFocus={true}
            persistentFocus={false}
          >
            <FormLabel>Password</FormLabel>
            <Input type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)} />
          </FocusLock>
        </ModalBody>
        <ModalFooter
          display='flex'
          justifyContent='flex-end'
        >
          <ButtonGroup
            size='sm'
          >
            <Button
              variant='outline'
              onClick={() => setShowAdminLogIn(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme='red'
              onClick={onLogIn}
            >
              Apply
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
export default AdminLogin