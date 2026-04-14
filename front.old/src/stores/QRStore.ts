import { create } from 'zustand'
import axios from 'axios'
import { getCommunicationInfo } from '../stores'
import QrScanner from 'qr-scanner'
import { QrLoginScan } from '../type'
import { sleep } from '../utils'


type UseFetchQR = {
    fetchQR: boolean,
    qrKey: string,
    setFetchQR: (b: boolean) => void,
    getQrKey: () => void,
}


async function fetchQRKey() {
    const { server, token } = getCommunicationInfo()
    try {
        let res = await axios.get(`${server}/api/qr-token`,
            {
                headers: {
                    token: token
                }
            }
        )
        interface QRKey {
            qrToken: string
        }
        let keyJson = res.data as QRKey
        //console.log(keyJson.qrToken)                      
        useFetchQR.setState({ qrKey: keyJson.qrToken })
    } catch (err: any) {
        //console.log(err)
    }
}



export const useFetchQR = create<UseFetchQR>((set, get) => (
    {
        fetchQR: false,
        qrKey: '',
        setFetchQR: (b) => set( 
                {
                    fetchQR: b
                }
        ),
        getQrKey: async() => {
            await fetchQRKey()
        }                 
    }
))

type useQrScanner = {
    qrScanner: null | QrScanner,
    cameras: QrScanner.Camera[] | null,
    startScanner: () => void,
    stopScanner: () => void,
    setQrScanner: () => void,
    getCameras: () => Promise<QrScanner.Camera[]>,
    setCamera: (index:number) => void,
    scannedToken: QrLoginScan | null,
    setScannedToken: (t: QrLoginScan|null) => void,
}

export const useQrScanner = create<useQrScanner>((set, get) => (
    {
        qrScanner: null,
        startScanner: async () => {
            get().setQrScanner()
            let count = 0
            while(!get().qrScanner){
                await sleep(50)
                count++
                if(count > 30){
                    break
                }
            }
            await get().qrScanner?.start()
        },
        stopScanner: () => {
            get().qrScanner?.stop()
            get().qrScanner?.destroy()
            set({qrScanner: null})
        },
        setQrScanner: async () => {
            get().getCameras()
            get().stopScanner()
            let videoElement = document.getElementById('qrScanReader') as HTMLVideoElement | null
            let count = 0
            while(!videoElement ){
                await sleep(50)
                videoElement = document.getElementById('qrScanReader') as HTMLVideoElement | null
                count++
                if(count > 30){
                    break
                }
            }
            count = 0
            while (get().cameras == null){
                await sleep(50)
                count++
                if(count > 30){
                    break
                }
            }
            if(videoElement){
                set({qrScanner: new QrScanner(
                    videoElement,
                    result => {
                        //console.log('decoded qr code:', result)
                        set({scannedToken: JSON.parse(result.data) as QrLoginScan})
                        get().qrScanner?.stop()
                    },
                    { /* your options or returnDetailedScanResult: true if you're not specifying any other options */ },
                )})
            }
        },
        cameras: null,
        getCameras: async () => {
            let scan = await QrScanner.hasCamera()
            if(scan){
                let cams = await QrScanner.listCameras()
                set({cameras: cams})
                return cams
            }
            return [] as QrScanner.Camera[]
        },
        setCamera: (c) => {
            let cams = get().cameras
            get().stopScanner()

            if(cams){
                get().qrScanner?.setCamera(cams[c].id)
            }
            get().startScanner()
        },
        scannedToken: null,
        setScannedToken: (t) => {
            set({scannedToken: t})
        },
    }
))

export default useFetchQR