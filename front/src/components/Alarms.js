import React, { useContext, useEffect } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import { useNavigate } from "react-router-dom";

const Alarms = () => {
	const { token, sessionStatus } = useContext(SessionContext);
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
		<div>
			<h2>sitä sun tätä</h2>
		</div>
	)
}

export default Alarms;