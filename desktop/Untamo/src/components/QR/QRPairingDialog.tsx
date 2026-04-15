import React from 'preact/compat'
import { usePopups } from '../../stores'

function QRPairingDialog() {
    const setShowQRDialog = usePopups((state) => state.setShowQRDialog)
    const showQRDialog = usePopups((state) => state.showQRDialog)

    if (!showQRDialog) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1010 }}>
            <div className="modal-box max-w-xs">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowQRDialog(false)}>✕</button>
                <h3 className="font-bold text-lg mb-4">Scan QR code</h3>
                <div className="flex justify-center pb-4">
                    <div id="qrPairCanvas" className="w-57 h-57" />
                </div>
            </div>
        </div>
    )
}

export default QRPairingDialog
