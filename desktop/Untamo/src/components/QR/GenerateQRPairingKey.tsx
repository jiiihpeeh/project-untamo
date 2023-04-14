import React,{  useEffect } from 'react'
import { useServer, useFetchQR, useTimeouts } from '../../stores'
import { invoke } from '@tauri-apps/api/tauri'

const GenerateQRPairingKey = () => {
  const fetchQR = useFetchQR((state) => state.fetchQR)
  const getQrKey = useFetchQR((state) => state.getQrKey)
  const server = useServer((state) => state.address)
  const qrKey  = useFetchQR((state)=> state.qrKey)
  const timeOut = useTimeouts((state)=> state.qrID)
  const clearQrTimeout = useTimeouts((state)=> state.clearQrTimeout)
  const setQrTimeout = useTimeouts((state)=> state.setQrID)
  const setQrUrl = useFetchQR((state)=> state.setQrUrl)

  const fetchKey = async () => {
    if(fetchQR){
      getQrKey()
      let timeOut = setTimeout(fetchKey, 15000)
      setQrTimeout(timeOut)
    }
  }

  useEffect(() => {  
    const renderQrKey = async() => {
      if(qrKey && qrKey !== ''){        
        let ensure = ''
        for(let i =0; i< 24; i++){
          ensure = `${Math.round(Math.random() * 16).toString(16)}${ensure}`
        }
        let qrKeyMod = qrKey.split('').reverse().join('')
        qrKeyMod = qrKeyMod.slice(0,29)+ensure.slice(16,23)+qrKeyMod.slice(29,36)+qrKeyMod.slice(36,).split('').reverse().join('')
        let qrObject = JSON.stringify(
                                        {
                                          token: ensure.slice(11,15) + qrKeyMod + ensure.slice(0,10), 
                                          server: server, 
                                        }
                                      )
        let qrString = await (invoke('get_qr_svg', { qrString: qrObject}) as Promise<string>)
        setQrUrl(qrString)
      }
    }
    renderQrKey()
  },[qrKey])

  useEffect(() => {
    //console.log("fetchQR ", fetchQR, timeOut)
    if(fetchQR && !timeOut){
      fetchKey()
    }
    else if(fetchQR === false){
      if(timeOut){
        clearQrTimeout()
      }
    }
  },[fetchQR])
  return (<></>)
 
}

export default GenerateQRPairingKey

