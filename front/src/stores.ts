import  useServer from './stores/serverStore' 
import useLogIn from './stores/loginStore' 
import useFetchQR from './stores/QRStore'
import useAdmin from './stores/adminStore'
import useDevices from './stores/deviceStore'
import useAlarms from './stores/alarmStore'
import useTimeouts from './stores/timeouts'
import usePopups from './stores/popUpStore'
import useAudio from './stores/audioStore'

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

export 
    { 
        useServer, useLogIn, useFetchQR, useAdmin, useAudio, extend,
        useDevices,useAlarms, useTimeouts, usePopups, getCommunicationInfo 
    }