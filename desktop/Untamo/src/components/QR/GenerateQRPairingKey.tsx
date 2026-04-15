import { invoke } from '@tauri-apps/api/core'
import React, { useEffect } from 'preact/compat'
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
      const t = setTimeout(fetchKey, 15000)
      setQrTimeout(t)
    }
  }

  useEffect(() => {
    const renderQrKey = async () => {
      if (qrKey && qrKey !== '') {
        const container = document.getElementById('qrPairCanvas')
        if (container) {
          const qrObject = JSON.stringify({ token: qrKey, server })
          const svg = await invoke<string>('get_qr_svg', { qrString: qrObject })
          container.innerHTML = svg
        }
      }
    }
    renderQrKey()
  }, [qrKey])

  useEffect(() => {
    if (fetchQR && !timeOut) {
      fetchKey()
    } else if (fetchQR === false) {
      if (timeOut) {
        clearQrTimeout()
      }
    }
  }, [fetchQR])

  return (<></>)
}

export default GenerateQRPairingKey
