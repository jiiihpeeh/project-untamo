import { create } from 'zustand'
import axios from 'axios'
import useServer from './serverStore'
import useLogIn from './loginStore'

const getCommunicationInfo = () => {
    const server = useServer.getState().address
    const token = useLogIn.getState().token
    return { 
                server: server,
                token: token
           }
}

type UseFetchQR = {
    fetchQR: boolean,
    qrKey: string,
    setFetchQR: (b: boolean) => void,
    getQrKey: () => void,
}

const fetchQRKey = async() =>{
    const {server, token} = getCommunicationInfo()
    try{
        let res = await axios.post(`${server}/api/qr-token`, 
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