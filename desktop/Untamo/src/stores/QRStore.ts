import { create, StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { apiGet } from './api'
import { Command } from '@tauri-apps/plugin-shell'
import { QrLoginScan } from '../type'
// circular import — safe: useStore only accessed inside function bodies after init
import { useStore } from './store'

async function fetchQRKey() {
    try {
        interface QRKey { qrToken: string }
        const keyJson = await apiGet<QRKey>('/api/qr-token')
        useStore.setState({ qrKey: keyJson.qrToken })
    } catch {
        //
    }
}

export interface QRSlice {
    fetchQR: boolean
    qrKey:   string
    setFetchQR: (b: boolean) => void
    getQrKey:   () => void
}

export const createQRSlice: StateCreator<BoundStore, [], [], QRSlice> = (set) => ({
    fetchQR: false,
    qrKey:   '',
    setFetchQR: (b) => set({ fetchQR: b }),
    getQrKey: async () => { await fetchQRKey() },
})

// QR scanner using zbarcam sidecar via Tauri shell plugin
type UseQrScanner = {
    scanning:       boolean
    scannedToken:   QrLoginScan | null
    startScanner:   () => Promise<void>
    stopScanner:    () => void
    setScannedToken:(t: QrLoginScan | null) => void
}

export const useQrScanner = create<UseQrScanner>((set, get) => ({
    scanning: false,
    scannedToken: null,
    startScanner: async () => {
        if (get().scanning) return
        set({ scanning: true, scannedToken: null })
        try {
            // zbarcam -1 opens the camera, scans one QR code, prints
            // "QR-Code:<data>" to stdout, then exits
            const { stdout } = await Command.create('zbarcam', ['-1']).execute()
            const line = stdout.trim()
            if (line.startsWith('QR-Code:')) {
                const raw = line.slice('QR-Code:'.length)
                set({ scannedToken: JSON.parse(raw) as QrLoginScan })
            }
        } catch {
            // zbarcam unavailable or user closed the window
        }
        set({ scanning: false })
    },
    stopScanner: () => {
        // zbarcam manages its own window; resetting state is sufficient
        set({ scanning: false })
    },
    setScannedToken: (t) => set({ scannedToken: t }),
}))

export default useQrScanner
