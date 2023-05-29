import { create } from 'zustand'
import { getCommunicationInfo } from '../stores'
import { Body, getClient, ResponseType } from "@tauri-apps/api/http"
import { isSuccess, sleep } from '../utils'
import QrScanner from 'qr-scanner'
import { QrLoginScan } from '../type'
import { platform } from '@tauri-apps/api/os'
import { Command } from '@tauri-apps/api/shell'
import { notification, Status } from '../components/notification'

type UseFetchQR = {
    fetchQR: boolean,
    qrKey: string,
    setFetchQR: (b: boolean) => void,
    getQrKey: () => void,
    qrUrl: string,
    setQrUrl: (svg: string) => void 
}

async function fetchQRKey() {
    const { server, token } = getCommunicationInfo()
    try {
        const client = await getClient()
        let res = await client.request(
            {
                url: `${server}/api/qr-token`,
                method: "GET",
                responseType: ResponseType.JSON,
                headers: {
                    token: token
                }
            }
        )
        isSuccess(res)
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

const useFetchQR = create<UseFetchQR>((set,get) => (
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
        },
        qrUrl: "",
        setQrUrl: (svg: string) => {
            let svgUrl = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}))
            try{
                URL.revokeObjectURL(get().qrUrl)
                
            }catch(e:any){}
            set(
                {
                    qrUrl: svgUrl
                }
            )
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
            let os = await platform()
            if (os === "linux"){
                //notify user to install zbar-tools
                notification("Running zbarcam","Please install zbar-tools to use QR code scanner if nothing happens", Status.Info)
                //run zbarcam
                const output = await new Command('zbarcam', ['-1']).execute()
                try{
                    //extract qr code by taking off "QR-Code:"
                    let qrPart = output.stdout.split("QR-Code:")[1]
                    //console.log(qrPart)
                    let qrCode = JSON.parse(qrPart) as QrLoginScan
                    get().setScannedToken(qrCode)
                    //console.log(qrCode)
                }catch(err){
                    console.log(err)
                }
                return
            }
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
            //await  navigator.mediaDevices.getUserMedia({ video: true })
            await get().getCameras()
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
                                    )
                                }
                    )
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