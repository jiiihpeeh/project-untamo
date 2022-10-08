import axios from "axios";
import { SessionContext } from "../contexts/SessionContext";
import { useContext} from "react";
import { clearAudio } from "../audiostorage/audioDatabase";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button
  } from '@chakra-ui/react'

const LogOut = () => {
    const { token } = useContext(SessionContext);

    const logOut = async() =>{
        try {
            let res = await axios.get('http://localhost:3001/logout', {
            headers: {'token': token}
            })
            localStorage.clear()
            await clearAudio()
        }catch(err){}
    }
    const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Trigger modal</Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Lorem count={2} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )

};

export default LogOut;