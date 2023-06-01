import { useLogIn, usePopups  } from "../../stores"
import React, { useEffect } from 'react'
import { Modal, ModalBody, ModalHeader, ModalCloseButton, ModalOverlay, ModalContent, Button, ModalFooter } from '@chakra-ui/react'
import { useQrScanner } from "../../stores/QRStore"

function QrLogin() {
    const setShowQrCodeReader = usePopups((state) => state.setShowQrCodeReader)
    const showQrCodeReader = usePopups((state) => state.showQrCodeReader)
    const startScanner = useQrScanner((state) => state.startScanner)
    const scannedToken = useQrScanner((state) => state.scannedToken)
    const stopScanner = useQrScanner((state) => state.stopScanner)


    useEffect(() => {
        if (scannedToken) {
            setShowQrCodeReader(false)
            //logIn with token
            useLogIn.getState().logInWithQr(scannedToken)
        }
    }, [scannedToken])


    return (
        <Modal 
            isOpen={showQrCodeReader} 
            onClose={() => {
                                stopScanner()
                                setShowQrCodeReader(false)
                            }
                    }
            isCentered
        >
            <ModalOverlay />
            <ModalContent>
            <ModalHeader>
                Scan QR code
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <video 
                    id="qrScanReader"
                >   
                </video>
                <ModalFooter>
                    <Button
                        onClick={() => {startScanner()}}
                    >
                        Activate Camera
                    </Button>
                </ModalFooter>
            </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default QrLogin
