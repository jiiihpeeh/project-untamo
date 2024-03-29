import  useServer from './stores/serverStore' 
import useAlarms from './stores/alarmStore'
import useLogIn from './stores/loginStore' 
import useFetchQR from './stores/QRStore'
import useAdmin from './stores/adminStore'
import useDevices from './stores/deviceStore'
import useTimeouts from './stores/timeoutsStore'
import usePopups from './stores/popUpStore'
import useAudio from './stores/audioStore'
import useSettings from './stores/settingsStore'
import useTask from './stores/taskStore'
import { Path, SessionStatus } from './type'

function getCommunicationInfo() {
    const server = useServer.getState().address
    const token = useLogIn.getState().token
    return {
        server: server,
        token: token
    }
}

function extend(path: Path) {
    return useServer.getState().extend(path)
}
function validSession() {
    return useLogIn.getState().sessionValid === SessionStatus.Valid
}
function fingerprint() {
    return useLogIn.getState().fingerprint
}
export 
    { 
        useServer, useLogIn, useFetchQR, useAdmin, extend, fingerprint, getCommunicationInfo,
        useDevices,useAlarms, useTimeouts, usePopups , useSettings, useAudio, useTask, validSession
    }