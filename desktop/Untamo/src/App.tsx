import { useEffect, useRef, lazy, Suspense } from 'preact/compat'
import { Router } from './ui/Router'
import Alarms from './components/Alarms/Alarms'
import Activate from './components/User/Activate'
import About from './components/About'
import LogIn from './components/LogIn'
import Register from './components/Register/Register'
import Welcome from './components/Welcome'
import NavGrid from './components/NavGrid'
import Clueless from './components/Clueless'
import GenerateQRPairingKey from './components/QR/GenerateQRPairingKey'
import PlayAlarm from './components/Alarms/PlayAlarm'
import AlarmWatcher from './components/Alarms/AlarmWatcher'
import Admin from './components/Admin/Admin'
import DeleteAlarm from './components/Alarms/DeleteAlarm'
import EditAlarm from './components/Alarms/EditAlarm'
import { useLogIn, usePopups } from './stores'
import Navigator from './components/Navigator'
import DeviceDelete from './components/Device/DeviceDelete'
import DeviceEdit from './components/Device/DeviceEdit'
import AddDevice from './components/Device/AddDevice'
import QRPairingDialog from './components/QR/QRPairingDialog'
import LogOut from './components/User/LogOut'
import EditProfile from './components/User/EditProfile'
import AdminLogin from './components/Admin/AdminLogIn'
import ServerLocation from './components/ServerLocation'
import UserMenu from './components/User/UserMenu'
import DeviceMenu from './components/Device/DeviceMenu'
import AddAlarm from './components/Alarms/AddAlarm'
import Owner from './components/Admin/Owner'
import PasswordForgot from './components/PasswordForgot'
import { useSettings } from './stores'
import { isMobile } from 'react-device-detect';
import { sleep } from './utils'
import AlarmPop from './components/Alarms/AlarmPop'
import AdminPop from './components/Admin/AdminPop'
import Settings from './components/User/Settings'
import Color from './components/User/Colors'
const Task = lazy(() => import('./components/User/Task'))
import ClearSettings from './components/User/ClearSettings'
import ChangeAlarmColors from './components/User/ChangeColors'
import ResetPassword from './components/ResetPassword'
import ResendActivation from './components/ResendActivation'
import QrLogin from './components/QR/QrLogin'
import ThemeComponent from './components/User/Theme'
import './App.css'
import SaveColorScheme from './components/User/SaveColors'
import { ToastContainer } from './ui/Toast'
import { extend } from './stores'

function App() {
    const checkSession = useLogIn((state) => state.validateSession)
    const setMobile = usePopups((state) => state.setMobile)
    const navHeight = useSettings((state)=> state.height)
    const mb = useSettings((state)=> state.mb)
    const mt = useSettings((state)=> state.mt)

    const check = useRef(false)
    useEffect(() => {
        if (!check.current) {
            check.current = true
            sleep(5).then(() => checkSession())
        }
    }, [])
    useEffect(() => {
        setMobile(isMobile)
    }, [isMobile])

    return (
        <div className="App">
            <NavGrid/>
            <main
                style={{ marginTop: `${mt+2}px`, marginBottom: `${mb+navHeight}px` }}
                id="App-Container"
            >
                <Router />
                <GenerateQRPairingKey/>
                <AlarmWatcher/>
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
                <About/>
                <ServerLocation/>
                <AlarmPop/>
                <AdminPop/>
                <Color/>
                <Suspense fallback={null}><Task/></Suspense>
                <SaveColorScheme/>
            </main>
            <Settings/>
            <ClearSettings/>
            <ChangeAlarmColors/>
            <PasswordForgot/>
            <ResendActivation/>
            <QrLogin/>
            <ThemeComponent/>
            <ToastContainer />
        </div>
    )
}

export default App
