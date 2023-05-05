import { create } from 'zustand'
import { getCommunicationInfo } from '../stores'
import { Body, getClient, ResponseType } from "@tauri-apps/api/http"
import { isSuccess } from '../utils'
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
        const client = await getClient();
        let res = await client.request(
            {
                url: `${server}/api/qr-token`,
                method: "POST",
                body: Body.json({msg: "Generate a qr token for me, please... No hurry."}),
                responseType: ResponseType.JSON,
                headers: {
                    token: token
                }
            }
        )
        isSuccess(res)
        interface Resp{
                        key: string
                     }
        if(res && res.data){
            let data = res.data as Resp
            let key =  data.key
            useFetchQR.setState({qrKey: key})
        }

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