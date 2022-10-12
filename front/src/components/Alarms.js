import React, { useContext, useEffect } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import { useNavigate } from "react-router-dom";
import { Text} from '@chakra-ui/react'


const Alarms = () => {
	const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);
	const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
	
	console.log(token);
    const navigate = useNavigate();

	useEffect(() =>{
		if(!sessionStatus){
			navigate('/login');
		}
	},[token, sessionStatus])
	useEffect(() =>{
		if(!currentDevice){
			navigate('/welcome');
		}
	},[currentDevice])


	return (
		<Text>Hei</Text>
	)
}

export default Alarms;