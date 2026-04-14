import { useLogIn, usePopups } from "../../stores"
import React, { useEffect } from 'react'
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
            useLogIn.getState().logInWithQr(scannedToken)
        }
    }, [scannedToken])

    const onClose = () => { stopScanner(); setShowQrCodeReader(false) }

    if (!showQrCodeReader) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-sm">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>✕</button>
                <h3 className="font-bold text-lg mb-4">Scan QR code</h3>
                <div className="py-2">
                    <video id="qrScanReader" className="w-full" />
                </div>
                <div className="modal-action">
                    <button className="btn btn-primary" onClick={() => startScanner()}>Activate Camera</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose} />
        </div>
    )
}

export default QrLogin
