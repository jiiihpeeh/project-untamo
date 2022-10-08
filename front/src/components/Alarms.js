import React, { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";

const Alarms = () => {
	const { token } = useContext(SessionContext);
	const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);

	console.log(token);
	return (
		<div>
			<h2>sitä sun tätä</h2>
		</div>
	)
}

export default Alarms;