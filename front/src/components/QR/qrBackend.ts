
import QrScanner from "qr-scanner";


async function scanner(){
    const video = document.getElementById('qrScanReader') as HTMLVideoElement|null
    if(video){
        let scan =await QrScanner.hasCamera()

        console.log(scan)
        
    }


}
