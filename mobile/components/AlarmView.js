import { Button, Icon, Div,Text, View, Input, Image, Modal } from 'react-native-magnus';
import { DeviceContext } from '../context/DeviceContext';
import React, {useContext, useState, useEffect} from 'react';
import Welcome from './Welcome';
const AlarmView = () => {
    const { currentDevice, setCurrentDevice, devices } = useContext(DeviceContext);

    useEffect(() => {
     console.log('current device: ', currentDevice)
     console.log('devices: ',devices)
    },[currentDevice, devices])
    return(<>
        { currentDevice === null && 
            <Welcome/>
        }
        <Div>
            <Text>Hei</Text>
        </Div>
    </>)
}

export default AlarmView;