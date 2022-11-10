import { Div, Checkbox, Text } from "react-native-magnus";
import React , { useContext, useState, useEffect } from 'react';
import { DeviceContext } from '../../context/DeviceContext';
import { AlarmComponentsContext } from "./AlarmComponentsContext";
import { ScrollView } from "react-native";


const DeviceChecker = (props) => {
    const { devices } = useContext(DeviceContext);
    const { selectedDevices, setSelectedDevices } = useContext(AlarmComponentsContext);
    const [ displayDevices, setDisplayDevices ] = useState( [])        

    
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
                                    key={`device-check-${device.id}`}
                                    checked={selectedDevices.includes(device.id)}   
                                    onPress={() => deviceSelection(device.id)}
                                    prefix={
                                        <Text>
                                            <Text>{device.deviceName}</Text> <Text>{device.type}</Text>
                                        </Text>} 
                                    />
                                </>);
            };
            setDisplayDevices(deviceList);
        }
        deviceLister();
        
    },[devices, selectedDevices])


    return(
        <>
        <ScrollView>
            <Div ml={150} mt={20}>
                {displayDevices}
            </Div>
        </ScrollView>
        </>
    );
};
export default DeviceChecker;


