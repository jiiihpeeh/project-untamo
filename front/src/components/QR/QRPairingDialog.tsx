import React from 'react'
import {
  Modal, ModalOverlay,
  ModalContent, ModalHeader,
  ModalBody, ModalCloseButton,
  Link, Center 
} from '@chakra-ui/react'
import { usePopups } from '../../stores'


const QRPairingDialog = () => {
  const setShowQRDialog = usePopups((state)=> state.setShowQRDialog)
  const showQRDialog = usePopups((state)=> state.showQRDialog)

  return (
      <Modal 
        closeOnOverlayClick={false} 
        isOpen={showQRDialog} 
        onClose={()=>setShowQRDialog(false)} 
        size="sm"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Scan QR code
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            pb={6}
          >
            <Center>
              <canvas 
                id="qrPairCanvas" 
                width="228" 
                height="228"
              >
              </canvas>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
  )
}

export default QRPairingDialog

