import React,{  useEffect } from 'react'
import { useServer, useFetchQR, useTimeouts } from '../../stores'
import { invoke } from '@tauri-apps/api/tauri'

function GenerateQRPairingKey() {
  const fetchQR = useFetchQR((state) => state.fetchQR)
  const getQrKey = useFetchQR((state) => state.getQrKey)
  const server = useServer((state) => state.address)
  const qrKey = useFetchQR((state) => state.qrKey)
  const timeOut = useTimeouts((state) => state.qrID)
  const clearQrTimeout = useTimeouts((state) => state.clearQrTimeout)
  const setQrTimeout = useTimeouts((state) => state.setQrID)
  const setQrUrl = useFetchQR((state) => state.setQrUrl)

  async function fetchKey() {
    if (fetchQR) {
      getQrKey()
      let timeOut = setTimeout(fetchKey, 15000)
      setQrTimeout(timeOut)
    }
  }

  useEffect(() => {
    async function renderQrKey() {
      if (qrKey && qrKey !== '') {
        let qrCode = { token: qrKey, server: server}
        let qrString = await (invoke('get_qr_svg', { qrString: JSON.stringify(qrCode) }) as Promise<string>)
        setQrUrl(qrString)
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

