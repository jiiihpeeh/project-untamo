
import { useEffect, useState, useNavigate } from 'react';
import {Routes,Route, Link as ReachLink } from 'react-router-dom';
import Alarms from './components/Alarms';
import About from './components/About';
import LogIn from './components/LogIn';
import Register from './components/Register'
import Welcome from './components/Welcome';
import './App.css'
import axios from 'axios';

import { SessionContext }  from './contexts/SessionContext'
import { DeviceContext } from './contexts/DeviceContext' 
import { Grid, GridItem, Text, Link } from '@chakra-ui/react'

function App() {

	const [ token, setToken ] = useState(localStorage['token'] ? localStorage['token'] : undefined);
	const [userInfo, setUserInfo] = useState({
		user: localStorage['user'] ? localStorage['user'] : undefined,
		firstname: localStorage['firstname'] ? localStorage['firstname'] : undefined,
		lastname: localStorage['lastname'] ? localStorage['lastname'] : undefined,
		screenname: localStorage['screenname'] ? localStorage['screenname'] : undefined,
	});
	const [ currentDevice, setCurrentDevice ] = useState(localStorage['currentDevice'] ? localStorage['currentDevice'] : undefined);
	const [ devices, setDevices ] = useState(localStorage['devices'] ? JSON.parse(localStorage['devices']) : undefined) ;
	const [sessionStatus, setSessionStatus] = useState(undefined)
	//const navigate = useNavigate()
	useEffect(() => {
		const checkSession = async () => {
			try {
				let sessionToken = localStorage['token'] ? localStorage['token'] : undefined;
				let res = await axios.get('http://localhost:3001/api/issessionvalid',  {
					headers: {'token': sessionToken}
				});
				if(res.data.status){
					console.log("session valid");
					setSessionStatus(true);
					//navigate('/welcome');
				} else{
					setSessionStatus(false);
					//navigate('/login');
				}
			} catch(err){}
		};
		checkSession();
	},[]);
	//console.log(token)

	const Gridlink = (text) => {
		let titled = text.text.charAt(0).toUpperCase() + text.text.slice(1)
		console.log(titled)
		return (<>
			<GridItem>
				<Link as={ReachLink} to={`/${text.text}`}><Text as='b'>{titled}</Text></Link>
			</GridItem>
		</>)
	}
	return (
		
		<div className="App">
		<SessionContext.Provider value={{ token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus }}>
		<DeviceContext.Provider value={{ currentDevice, setCurrentDevice, devices, setDevices }}>
			<Grid  h='80px'
					templateRows='repeat(1, 1fr)'
					templateColumns='repeat(5, 1fr)'
					gap={4}>
				<Gridlink text="alarms"/>
				<Gridlink text="about"/>
				<Gridlink text="register"/>
				<Gridlink text="login"/>
				<Gridlink text="welcome"/>
			</Grid>
			
			<Routes>
				
					<Route exact path="/alarms" element={<Alarms/>}/>
					<Route path="/about" element={<About/>}/>
					<Route path="/login" element={<LogIn/>}/>
					<Route path="/register" element={<Register/>}/>
					<Route path="/welcome" element={<Welcome/>}/>
				
			</Routes>
		</DeviceContext.Provider>
		</SessionContext.Provider>    
    </div>
	
  );
}

export default App;
