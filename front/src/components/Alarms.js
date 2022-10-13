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
		<div>List of Alarms
			<table>
				<tr>
					<th>ID</th>
					<th>Occurence</th>
					<th>Time</th>
					<th>Weekday</th>
					<th>Date</th>
					<th>Label</th>
					<th>Devices</th>
					<th></th>
				</tr>
				<tr>
					<th>1</th>
					<th>daily</th>
					<th>08:30</th>
					<th></th>
					<th></th>
					<th>Herätys</th>
					<th>IOT-herätyskello, kännykkä</th>
					<th>Edit</th>
					<th>Delete</th>
				</tr>
				<tr>
					<th>2</th>
					<th>Weekly</th>
					<th>16:00</th>
					<th>Friday</th>
					<th></th>
					<th>Alko</th>
					<th>selain, kännykkä</th>
					<th>Edit</th>
					<th>Delete</th>


				</tr>
				<tr>
					<th>3</th>
					<th>Once</th>
					<th>14:00</th>
					<th>Monday</th>
					<th>6.12.2022</th>
					<th>Jorman tuparit</th>
					<th>selain</th>
					<th>Edit</th>
					<th>Delete</th>


				</tr>
				<tr>
					<th>4</th>
					<th>yearly</th>
					<th>12:00</th>
					<th></th>
					<th>24.12.</th>
					<th>joulu</th>
					<th>selain</th>
					<th>Edit</th>
					<th>Delete</th>

				</tr>
			</table>


		</div>
	)
}

export default Alarms;