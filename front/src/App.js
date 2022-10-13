
import { useEffect, useState, useNavigate } from 'react';
import { Routes,Route, Link as ReachLink, Navigate } from 'react-router-dom';
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
function App() {

	const [ token, setToken ] = useState(localStorage['token'] ? localStorage['token'] : undefined);
	const [userInfo, setUserInfo] = useState({
		user: localStorage['user'] ? localStorage['user'] : undefined,
		firstname: localStorage['firstname'] ? localStorage['firstname'] : undefined,
		lastname: localStorage['lastname'] ? localStorage['lastname'] : undefined,
		screenname: localStorage['screenname'] ? localStorage['screenname'] : undefined,
	});
	const [ currentDevice, setCurrentDevice ] = useState(localStorage['currentDevice'] ? localStorage['currentDevice'] : undefined);
	const [ devices, setDevices ] = useState(localStorage['devices'] ? JSON.parse(localStorage['devices']) : []) ;
	const [sessionStatus, setSessionStatus] = useState(undefined);
	const [viewableDevices, setViewableDevices] = useState([]);
	const [fetchQR, setFetchQR] = useState(false);
	const [ alarms, setAlarms ] = useState(localStorage['alarms'] ? JSON.parse(localStorage['alarms']) : []) ;

	const checkSession = async () => {
		let sessionToken = localStorage['token'] ? localStorage['token'] : undefined;
		if (sessionToken !== undefined){
			try {
				let res = await axios.get('http://localhost:3001/api/issessionvalid',  {
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
		<SessionContext.Provider value={{ token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus, fetchQR, setFetchQR }}>
		<DeviceContext.Provider value={{ currentDevice, setCurrentDevice, devices, setDevices, viewableDevices, setViewableDevices }}>
		<AlarmContext.Provider value={{ alarms, setAlarms }}>
			<NavGrid/>

			<Routes>
				
					<Route exact path="/alarms" element={<Alarms/>}/>
					<Route path="/about" element={<About/>}/>
					<Route path="/login" element={<LogIn/>}/>
					<Route path="/register" element={<Register/>}/>
					<Route path="/welcome" element={<Welcome/>}/>
					<Route path="/clueless" element={<Clueless/>}/>
					<Route path="*" element={<Navigate to="/clueless" /> } />
			</Routes>
		<GenerateQRPairingKey/>
		</AlarmContext.Provider>
		</DeviceContext.Provider>
		</SessionContext.Provider>    
    </div>
	
	);
}

export default App;
