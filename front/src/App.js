import { useEffect, useState } from 'react';
import { Routes,Route,  Navigate } from 'react-router-dom';
import Alarms from './components/Alarms';
import About from './components/About';
import LogIn from './components/LogIn';
import Register from './components/Register'
import Welcome from './components/Welcome';
import './App.css'
import axios from 'axios';
import { AlarmContext} from './contexts/AlarmContext'
import { SessionContext }  from './contexts/SessionContext'
import { DeviceContext } from './contexts/DeviceContext' 
import { notification } from './components/notification';
import NavGrid from './components/NavGrid';
import Clueless from './components/Clueless';
import GenerateQRPairingKey from './components/GenerateQRPairingKey';
import PlayAlarm from './components/PlayAlarm';
import AlarmWatcher from './components/AlarmWatcher';
import UserWatcher from './components/UserWatcher';
import Admin from './components/Admin';
import { AdminContext } from './contexts/AdminContext';
import AppAlert from './components/AppAlert';

function App() {
	const [ token, setToken ] = useState(localStorage['token'] ? localStorage['token'] : undefined);
	const [ server, setServer] = useState(localStorage['server'] ? JSON.parse(localStorage['server']) : 'http://localhost:3001')
	const [ userInfo, setUserInfo ] = useState(localStorage['userInfo'] ? JSON.parse(localStorage['userInfo']) : {});
	const [ currentDevice, setCurrentDevice ] = useState(localStorage['currentDevice'] ? localStorage['currentDevice'] : undefined);
	const [ devices, setDevices ] = useState(localStorage['devices'] ? JSON.parse(localStorage['devices']) : []) ;
	const [ sessionStatus, setSessionStatus ] = useState(undefined);
	const [ signInTime, setSignedInTime ] = useState((localStorage['signInTime'])? JSON.parse(localStorage['signInTime']) :0);
	const [ viewableDevices, setViewableDevices ] = useState(localStorage['viewableDevices'] ? JSON.parse(localStorage['viewableDevices']) : []);
	const [ fetchQR, setFetchQR ] = useState(false);
	const [ alarms, setAlarms ] = useState(localStorage['alarms'] ? JSON.parse(localStorage['alarms']) : []) ;
	const [ runAlarm, setRunAlarm ] = useState('');
	const [ runOtherSnooze, setRunOtherSnooze ] = useState(false);
	//Never ever  put admin in storage
	const [adminToken, setAdminToken] = useState(undefined);
	const [adminTime, setAdminTime] = useState(undefined);

	const checkSession = async () => {
		let sessionToken = localStorage['token'] ? localStorage['token'] : undefined;
		if (sessionToken !== undefined){
			try {
				let res = await axios.get(`${server}/api/issessionvalid`,  {
					headers: {'token': sessionToken}
				});
				if(res.data.status){
					console.log("session valid");
					setSessionStatus(true);
					notification("Session", "Continuing session.", 'info');
				} else {
					console.log(res.status);
					setSessionStatus(false);
				}
			} catch(err){
				if(err.response.status === 403){
					setSessionStatus(false);
					console.log("session invalid");
					notification("Session", "Session invalid.", 'error');
					
				}else{
					setSessionStatus(undefined);
					notification("Session", "Can not contact server.", 'warning');
				}
			}
		} else {
			setSessionStatus(false);
		}

	};

	useEffect(() => {

		checkSession();
	},[]);
	
	
	return (
		
		<div className="App">
		<SessionContext.Provider value={{ token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus, fetchQR, setFetchQR, signInTime, setSignedInTime, server, setServer  }}>
		<DeviceContext.Provider value={{ currentDevice, setCurrentDevice, devices, setDevices, viewableDevices, setViewableDevices }}>
		<AlarmContext.Provider value={{ alarms, setAlarms, runAlarm, setRunAlarm, runOtherSnooze, setRunOtherSnooze }}>
		<AdminContext.Provider value={{adminToken, setAdminToken, adminTime, setAdminTime}}>
			{/* <AppAlert/> */}
			<NavGrid/>

			<Routes>
					<Route exact path="/alarms" element={<Alarms/>}/>
					<Route path="/about" element={<About/>}/>
					<Route path="/login" element={<LogIn/>}/>
					<Route path="/register" element={<Register/>}/>
					<Route path="/welcome" element={<Welcome/>}/>
					<Route path="/playalarm" element={<PlayAlarm/>}/>
					<Route path="/clueless" element={<Clueless/>}/>
					<Route path="/admin" element={<Admin/>}/>
					<Route path="/" element={<Navigate to="/login" /> } />
					<Route path="*" element={<Navigate to="/clueless" /> } />
			</Routes>
		<GenerateQRPairingKey/>
		<AlarmWatcher/>
		<UserWatcher/>
		</AdminContext.Provider>
		</AlarmContext.Provider>
		</DeviceContext.Provider>
		</SessionContext.Provider>    
    </div>
	
	);
}

export default App;
