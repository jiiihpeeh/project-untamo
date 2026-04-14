import { create, StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { apiGet } from './api'
import QrScanner from 'qr-scanner'
import { QrLoginScan } from '../type'
import { sleep } from '../utils'
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

// QrScanner has DOM references — stays as standalone store
type UseQrScanner = {
    qrScanner:      null | QrScanner
    cameras:        QrScanner.Camera[] | null
    startScanner:   () => void
    stopScanner:    () => void
    setQrScanner:   () => void
    getCameras:     () => Promise<QrScanner.Camera[]>
    setCamera:      (index: number) => void
    scannedToken:   QrLoginScan | null
    setScannedToken:(t: QrLoginScan | null) => void
}

export const useQrScanner = create<UseQrScanner>((set, get) => ({
    qrScanner: null,
    startScanner: async () => {
        get().setQrScanner()
        let count = 0
        while (!get().qrScanner) {
            await sleep(50)
            count++
            if (count > 30) break
        }
        await get().qrScanner?.start()
    },
    stopScanner: () => {
        get().qrScanner?.stop()
        get().qrScanner?.destroy()
        set({ qrScanner: null })
    },
    setQrScanner: async () => {
        get().getCameras()
        get().stopScanner()
        let videoElement = document.getElementById('qrScanReader') as HTMLVideoElement | null
        let count = 0
        while (!videoElement) {
            await sleep(50)
            videoElement = document.getElementById('qrScanReader') as HTMLVideoElement | null
            count++
            if (count > 30) break
        }
        count = 0
        while (get().cameras == null) {
            await sleep(50)
            count++
            if (count > 30) break
        }
        if (videoElement) {
            set({
                qrScanner: new QrScanner(
                    videoElement,
                    result => {
                        set({ scannedToken: JSON.parse(result.data) as QrLoginScan })
                        get().qrScanner?.stop()
                    },
                    {},
                )
            })
        }
    },
    cameras: null,
    getCameras: async () => {
        const scan = await QrScanner.hasCamera()
        if (scan) {
            const cams = await QrScanner.listCameras()
            set({ cameras: cams })
            return cams
        }
        return [] as QrScanner.Camera[]
    },
    setCamera: (c) => {
        const cams = get().cameras
        get().stopScanner()
        if (cams) {
            get().qrScanner?.setCamera(cams[c].id)
        }
        get().startScanner()
    },
    scannedToken: null,
    setScannedToken: (t) => set({ scannedToken: t }),
}))

export default useQrScanner
