import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Link,
  Center,
  useDisclosure
} from '@chakra-ui/react';



const QRPairingDialog = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {setFetchQR} = useContext(SessionContext);

  const openWindow = () => {
    onOpen()
    setFetchQR(true)
  } 
  const closeWindow = () => {
    setFetchQR(false)
    onClose()
  }
  return (
      <>
      <Link onClick={openWindow}>Pair a device (QR code)</Link>

      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={closeWindow} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Scan QR code</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Center>
              <canvas id="qrpaircanvas" width="228" height="228"></canvas>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
      </>
  );
};

export default QRPairingDialog;

