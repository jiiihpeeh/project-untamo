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
import AppAlert from './components/AppAlert'
import DeleteAlarm from './components/Alarms/DeleteAlarm'
import EditAlarm from './components/Alarms/EditAlarm'
import { useLogIn } from './stores'
import { SessionStatus } from './type.d'
import Navigator from './components/Navigator'
import DeviceDelete from './components/Device/DeviceDelete'
import DeviceEdit from './components/Device/DeviceEdit'
import AlarmNotification from './components/Alarms/AlarmNotification'
import AddDevice from './components/Device/AddDevice'
import DeviceSelector from './components/Device/DeviceSelector'
import QRPairingDialog from './components/QR/QRPairingDialog'
import LogOut from './components/User/LogOut'
import EditProfile from './components/User/EditProfile'
import AdminLogin from './components/Admin/AdminLogIn'
import ServerLocation from './components/ServerLocation'
import UserMenu from './components/User/UserMenu'
import DeviceMenu from './components/Device/DeviceMenu'
import AddAlarm from './components/Alarms/AddAlarm'
import { extend } from './stores'
import './App.css'

function App() {
	const checkSession = useLogIn((state) => state.validateSession)
	const check = useRef(false)

	useEffect(() => {
		const checker = async() =>{
			if(!check.current){
				check.current = true
				checkSession()
			}
		}
		checker()
	},[])
	
	
	return (
		
		<div className="App">
			{/* <AppAlert/> */}
			<NavGrid/>
			<Routes>
					<Route path ={extend("/alarms")} element={<Alarms/>}/>
					<Route path={extend("/about")} element={<About/>}/>
					<Route path={extend("/login")} element={<LogIn/>}/>
					<Route path={extend("/register")} element={<Register/>}/>
					<Route path={extend("/welcome")} element={<Welcome/>}/>
					<Route path={extend("/play-alarm")} element={<PlayAlarm/>}/>
					<Route path={extend("/clueless")} element={<Clueless/>}/>
					<Route path={extend("/admin")} element={<Admin/>}/>
					<Route path={extend("/")} element={<Navigate to={extend("/login")} /> } />
					<Route path="*" element={<Navigate to={extend("/clueless")} /> } />
			</Routes>
			<GenerateQRPairingKey/>
			<AlarmWatcher/>
			<UserWatcher/>
			<DeleteAlarm/>
			<EditAlarm/>
			<DeviceDelete/>
			<DeviceEdit/>
			<AddDevice/>
			<DeviceSelector/>
			<QRPairingDialog/>
			<LogOut/>
			<EditProfile/>
			<AdminLogin/>
			<UserMenu/>
			<DeviceMenu/>
			<AddAlarm/>

			<Navigator/>
			<AlarmNotification/>
			<About/>
			<ServerLocation/>
    </div>
	)
}

export default App
