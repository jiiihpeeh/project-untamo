import { Modal, ModalContent,  ModalHeader, ModalFooter,
         ModalBody, ModalCloseButton,  Button,
         ButtonGroup,  FormLabel,Input, HStack} from '@chakra-ui/react'
import { FocusLock } from '@chakra-ui/focus-lock'
import React, { useState, useEffect }  from 'react'
import { usePopups } from '../stores' 
import useServer from '../stores/serverStore'
import  {pingServer} from '../utils'

function ServerLocation() {
  const server = useServer((state) => state.address)
  const setServer = useServer((state) => state.setAddress)
  const setShowServerEdit = usePopups((state) => state.setShowServerEdit)
  const showServerEdit = usePopups((state) => state.showServerEdit)
  const [serverString, setServerString] = useState(server)

  function onApply() {
    setServer(serverString)
    setShowServerEdit(false)
  }
  useEffect(() => {
    if (showServerEdit) {
      setServerString(server)
    }
  }, [showServerEdit])
  return (
    <Modal
      returnFocusOnClose={false}
      isOpen={showServerEdit}
      onClose={() => setShowServerEdit(false)}
      isCentered
    >
      <ModalContent>
        <ModalHeader
          fontWeight='semibold'
        >
          Set Server Address
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FocusLock
            //returnFocus={true}
            persistentFocus={false}
          >
            <FormLabel>
              Address
            </FormLabel>
            <HStack>
              <Input
                type="text"
                value={serverString}
                onChange={(e) => setServerString(e.target.value)} />
              <Button
                onClick={(e) => pingServer(serverString)}
              >
                Test
              </Button>
            </HStack>
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
              onClick={() => setShowServerEdit(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme='red'
              onClick={onApply}
            >
              Apply
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
export default ServerLocation