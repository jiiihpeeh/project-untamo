import { Div, Checkbox, Text } from "react-native-magnus";
import React , { useContext, useState, useEffect } from 'react';
import { DeviceContext } from '../../context/DeviceContext';
import { AlarmComponentsContext } from "./AlarmComponentsContext";

const DeviceChecker = (props) => {
    const { devices } = useContext(DeviceContext);
    const { selectedDevices, setSelectedDevices } = useContext(AlarmComponentsContext);
    const [ displayDevices, setDisplayDevices ] = useState([])
    const deviceSelection = ( id) => {
        if(selectedDevices.includes(id)){
            setSelectedDevices(selectedDevices.filter(device => device !== id));
        }else {
            setSelectedDevices([...selectedDevices,id]);
        };
    };
    useEffect(() =>{
        const deviceLister = () => {
            let deviceList = [];
            for( const device of devices){
                deviceList.push(<> 
                                <Checkbox 
                                    checked={selectedDevices.includes(device.id)}   
                                    onChange={() => deviceSelection(device.id)}  
                                    prefix={
                                        <Text flex={1}>
                                            {device.deviceName} {device.type}
                                        </Text>} 
                                    />
                                </>);
            };
            setDisplayDevices(deviceList)
        };
        deviceLister()
    },[selectedDevices, devices])


    return(
        <>
        <Div>
            {displayDevices}
        </Div>
        </>
    );
};
export default DeviceChecker;


