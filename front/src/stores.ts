import  useServer from './stores/serverStore' 
import useAlarms from './stores/alarmStore'
import useLogIn from './stores/loginStore' 
import useFetchQR from './stores/QRStore'
import useAdmin from './stores/adminStore'
import useDevices from './stores/deviceStore'
import useTimeouts from './stores/timeouts'
import usePopups from './stores/popUpStore'
import useAudio from './stores/audioStore'
import useSettings from './stores/settingsStore'

const getCommunicationInfo = () => {
    const server = useServer.getState().address
    const token = useLogIn.getState().token
    return { 
                server: server,
                token: token
           }
}

const extend = (path: string) => {
    return useServer.getState().extend(path)
}

const fingerprint = () =>  useLogIn.getState().fingerprint
export 
    { 
        useServer, useLogIn, useFetchQR, useAdmin, extend, fingerprint, getCommunicationInfo,
        useDevices,useAlarms, useTimeouts, usePopups , useSettings, useAudio,
    }