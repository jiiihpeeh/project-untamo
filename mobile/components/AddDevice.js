import { useEffect, useContext, useState } from "react";

import { DeviceContext } from "../context/DeviceContext";
import { SessionContext } from "../context/SessionContext";
import axios  from 'axios';
import { Button, Icon, Div,Text, View, Input, Image, Modal, Dropdown } from 'react-native-magnus';
import DeviceTypes from "./DeviceTypes";
import AsyncStorage from '@react-native-async-storage/async-storage';
const AddDevice = () => {
    const [ deviceName, setDeviceName ] = useState('');
    const [ deviceType, setDeviceType ] = useState('Phone');
    const [ visible, setVisible ] = useState(false);
    const {token, server} = useContext(SessionContext);
    const { devices, setDevices } = useContext(DeviceContext);
    const createDevice = async () => {
        try {
            let res = await axios.post(`${server}/api/device`, 
                {deviceName: deviceName, type: deviceType}, 
                {headers:{token:token}});
            let newDevice = {deviceName: deviceName, type: deviceType, id: res.data.id}
            let newDevices = devices;
            newDevices.push(newDevice);
            setDevices(newDevices);
            await AsyncStorage.setItem('devices', JSON.stringify(newDevices));
            setVisible(false);
        } catch (error) {
            console.log(error);
        }
    }
    return(
        <>
        <Button block m={10} onPress={() => setVisible(true)} bg={"teal"}>
          Add a Device
        </Button>

        <Modal isVisible={visible}>
            <Div>
                <Button
                    bg="gray400"
                    h={35}
                    w={35}
                    position="absolute"
                    top={40}
                    right={15}
                    rounded="circle"
                    onPress={() => {
                    setVisible(false);
                    }}
                >
                    <Icon color="black900" name="close" />
                </Button>
                <Input 
                        mt={90}
                        mb={10}
                        placeholder="Device name"
                        value={deviceName}
                        onChangeText={text => setDeviceName(text)} 
                />
                <DeviceTypes 
                    setDeviceType={setDeviceType}
                    deviceType={deviceType}
                />            
                <Button 
                    onPress={createDevice}
                    m={10}    
                >
                    OK
                </Button>
            </Div>
        </Modal>
        </>
    )

}

export default AddDevice;