import React from 'react'
import { useDevices } from "../../../stores"
import useAlarm from "./alarmStates"

const DeviceChecker = () => {
    const devices  = useDevices((state)=>state.devices);
    const selectedDevices = useAlarm((state) => state.devices);
    const toggleDevices = useAlarm((state)=> state.toggleDevices);

    const deviceLister = () => {
        return devices.map(device =>
                {
                    return(
                            <tr 
                                key={`deviceList-${device.id}`} 
                            >
                                <td>
                                    <div className='hstack'>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedDevices.includes(device.id)} 
                                            onChange={() => toggleDevices(device.id)}
                                        /> 
                                        <span>
                                            {device.deviceName}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span>
                                        {device.type}
                                    </span>
                                </td>
                            </tr> 
                    )
                }
            )
    }

    return(
        <div
            className="center"
            onMouseDown={e=>e.preventDefault()}
        >
            <div>
            <table className="ui-table">
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {deviceLister()}
                </tbody>
            </table>
            </div>
        </div>
    )
}
export default DeviceChecker