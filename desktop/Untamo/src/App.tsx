import React, { useEffect, useRef } from 'react'
import { Routes,Route,  Navigate } from 'react-router-dom'
import Alarms from './components/Alarms/Alarms'
import About from './components/About'
import LogIn from './components/LogIn'
import Register from './components/Register/Register'
import Welcome from './components/Welcome'
import NavGrid from './components/NavGrid'
import Clueless from './components/Clueless'
import GenerateQRPairingKey from './components/QR/GenerateQRPairingKey'
import PlayAlarm from './components/Alarms/PlayAlarm'
import AlarmWatcher from './components/Alarms/AlarmWatcher'
import UserWatcher from './components/User/UserWatcher'
import Admin from './components/Admin/Admin'
import DeleteAlarm from './components/Alarms/DeleteAlarm'
import EditAlarm from './components/Alarms/EditAlarm'
import { useLogIn, usePopups } from './stores'
import { Path } from './type'
import Navigator from './components/Navigator'
import DeviceDelete from './components/Device/DeviceDelete'
import DeviceEdit from './components/Device/DeviceEdit'
import AlarmNotification from './components/Alarms/AlarmNotification'
import AddDevice from './components/Device/AddDevice'
import QRPairingDialog from './components/QR/QRPairingDialog'
import LogOut from './components/User/LogOut'
import EditProfile from './components/User/EditProfile'
import AdminLogin from './components/Admin/AdminLogIn'
import ServerLocation from './components/ServerLocation'
import UserMenu from './components/User/UserMenu'
import DeviceMenu from './components/Device/DeviceMenu'
import AddAlarm from './components/Alarms/AddAlarm'
import { extend, useSettings } from './stores'
import { isMobile } from 'react-device-detect';
import sleep from './components/sleep'
import { Container } from '@chakra-ui/react'
import AlarmPop from './components/Alarms/AlarmPop'
import AdminPop from './components/Admin/AdminPop'
import Settings from './components/User/Settings'
import Color from './components/User/Colors'
import Task from './components/User/Task'
import ClearSettings from './components/User/ClearSettings'
import { appWindow } from '@tauri-apps/api/window'
import CloseAction from './components/User/TauriWindow'
import './App.css'


const unlisten = await appWindow.onCloseRequested(async (event) => {
  event.preventDefault()
  usePopups.getState().setShowCloseApp(true)
})

  
function App() {
    const checkSession = useLogIn((state) => state.validateSession)
    const setMobile = usePopups((state) => state.setMobile)
    const navHeight = useSettings((state)=> state.height)
    const mb = useSettings((state)=> state.mb)
    const mt = useSettings((state)=> state.mt)

    const check = useRef(false)

    useEffect(() => {
        const checker = async() =>{
            if(!check.current){
                await sleep(5)
                check.current = true
                checkSession()
            }
        }
        checker()
    },[])
    useEffect(()=>{
        setMobile(isMobile)
    },[isMobile])

    return (
        <Container className="App">
            {/* <App/> */}
            <NavGrid/>
            <Container 
                as="main" 
                mt={`${mt+2}px`} 
                mb={`${mb+navHeight}px`} 
                id="App-Container" 
            >
                <Routes>
                    <Route path ={extend(Path.Alarms)} element={<Alarms/>}/>
                    <Route path={extend(Path.LogIn)} element={<LogIn/>}/>
                    <Route path={extend(Path.Register)} element={<Register/>}/>
                    <Route path={extend(Path.Welcome)} element={<Welcome/>}/>
                    <Route path={extend(Path.PlayAlarm)} element={<PlayAlarm/>}/>
                    <Route path={extend(Path.Clueless)} element={<Clueless/>}/>
                    <Route path={extend(Path.Admin)} element={<Admin/>}/>
                    <Route path={extend(Path.Base)} element={<Navigate to={extend(Path.LogIn)} /> } />
                    <Route path="*" element={<Navigate to={extend(Path.LogIn)} /> } />
                </Routes>
                <GenerateQRPairingKey/>
                <AlarmWatcher/>
                <UserWatcher/>
                <DeleteAlarm/>
                <EditAlarm/>
                <DeviceDelete/>
                <DeviceEdit/>
                <AddDevice/>
                <QRPairingDialog/>
                <LogOut/>
                <EditProfile/>
                <AdminLogin/>
                <UserMenu/>
                <DeviceMenu/>
                <AddAlarm/>
                <Navigator/>
                {/* <AlarmNotification/> */}
                <About/>
                <ServerLocation/>
                <AlarmPop/>
                <AdminPop/>
                <Color/>
                <Task/>
            </Container>
        <Settings/>
        <ClearSettings/>
        <CloseAction/>
    </Container>
    )
}

export default App
