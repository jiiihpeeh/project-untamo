import QRCode from 'qrcode'
import React,{  useEffect } from 'react'
import { useServer, useFetchQR, useTimeouts } from '../../stores'

function GenerateQRPairingKey() {
  const fetchQR = useFetchQR((state) => state.fetchQR)
  const getQrKey = useFetchQR((state) => state.getQrKey)
  const server = useServer((state) => state.address)
  const qrKey = useFetchQR((state) => state.qrKey)
  const timeOut = useTimeouts((state) => state.qrID)
  const clearQrTimeout = useTimeouts((state) => state.clearQrTimeout)
  const setQrTimeout = useTimeouts((state) => state.setQrID)

  async function fetchKey() {
    if (fetchQR) {
      getQrKey()
      let timeOut = setTimeout(fetchKey, 15000)
      setQrTimeout(timeOut)
    }
  }

  useEffect(() => {
    const renderQrKey = async () => {
      if (qrKey && qrKey !== '') {
        let qrCanvas = document.getElementById('qrPairCanvas')

        if (qrCanvas) {
          let qrObject = JSON.stringify(
            {
              token: qrKey,
              server: server,
            }
          )
          //console.log(qrObject)                            
          QRCode.toCanvas(qrCanvas, qrObject, function (error) {
            if (error) {
              //console.error('qr', error)
            }
          }
          )
        }
      }
    }
    renderQrKey()
  }, [qrKey])

  useEffect(() => {
    //console.log("fetchQR ", fetchQR, timeOut)
    if (fetchQR && !timeOut) {
      fetchKey()
    }
    else if (fetchQR === false) {
      if (timeOut) {
        clearQrTimeout()
      }
    }
  }, [fetchQR])
  return (<></>)

}

export default GenerateQRPairingKey

