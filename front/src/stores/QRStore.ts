import { create } from 'zustand'
import axios from 'axios'
import { getCommunicationInfo } from '../stores'

type UseFetchQR = {
    fetchQR: boolean,
    qrKey: string,
    setFetchQR: (b: boolean) => void,
    getQrKey: () => void,
}

const fetchQRKey = async() =>{
    const {server, token} = getCommunicationInfo()
    try{
        let res = await axios.get(`${server}/api/qr-token`, 
                                    {
                                      headers: 
                                                {
                                                    token: token
                                                }
                                    }
                         )
        interface QRKey {
            qrToken: string
        }
        let keyJson =  res.data as QRKey 
        //console.log(keyJson.qrToken)                      
        useFetchQR.setState({qrKey: keyJson.qrToken})
    }catch(err:any){
        //console.log(err)
    }
}

const useFetchQR = create<UseFetchQR>((set) => (
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
    }
))

export default useFetchQR