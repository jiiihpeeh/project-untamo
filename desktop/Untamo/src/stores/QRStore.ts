import { create } from 'zustand'
import axios from 'axios'
import { getCommunicationInfo } from '../stores'

type UseFetchQR = {
    fetchQR: boolean,
    qrKey: string,
    setFetchQR: (b: boolean) => void,
    getQrKey: () => void,
    qrUrl: string,
    setQrUrl: (svg: string) => void 
}

const fetchQRKey = async() =>{
    const {server, token} = getCommunicationInfo()
    try{
        let res = await axios.post(`${server}/api/qrToken`, 
                                    {
                                      msg: "Generate a qr token for me, please... No hurry."
                                    }, 
                                    {
                                      headers: 
                                                {
                                                    token: token
                                                }
                                    }
                                )
        let key =  res.data.key as string 
        //console.log(key)                      
        useFetchQR.setState({qrKey: key})
    }catch(err:any){
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

export default useFetchQR