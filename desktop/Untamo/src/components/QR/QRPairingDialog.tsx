import React from 'react'
import {  Modal, ModalOverlay,
          ModalContent, ModalHeader,
          ModalBody, ModalCloseButton,
          Link, Center , Image
        } from '@chakra-ui/react'
import { usePopups, useFetchQR } from '../../stores'

function QRPairingDialog() {
  const setShowQRDialog = usePopups((state) => state.setShowQRDialog)
  const showQRDialog = usePopups((state) => state.showQRDialog)
  const qrUrl = useFetchQR((state) => state.qrUrl)

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={showQRDialog}
        onClose={() => setShowQRDialog(false)}
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
              <Image
                src={qrUrl}
                height={290}
                alt='QR' />
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default QRPairingDialog

