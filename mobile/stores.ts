import  useServer from './stores/serverStore' 
import useAlarms from './stores/alarmStore'
import useLogIn from './stores/loginStore' 
import useFetchQR from './stores/QRStore'
import useDevices from './stores/deviceStore'
import useTimeouts from './stores/timeouts'
import usePopups from './stores/popUpStore'
import useMessage from './stores/messageStore'
//import useAudio from './stores/audioStore'

const getCommunicationInfo = () => {
    const server = useServer.getState().address
    const token = useLogIn.getState().token
    return { 
                server: server,
                token: token
           }
}



export 
    { 
        useServer, useLogIn, useFetchQR, useMessage,
        useDevices,useAlarms, useTimeouts, usePopups, getCommunicationInfo 
    }