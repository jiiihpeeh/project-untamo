import { useState, useEffect, useContext } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from "axios";
import LogIn from './LogIn';
import { SessionContext } from './contexts/SessionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput,  
        Provider,
        Stack,
        Button,
        Dialog,
        DialogContent,
        HStack,
        ListItem} from '@react-native-material/core';
import { DeviceContext } from './contexts/DeviceContext';
const AddDeviceAction = ({ navigation }) => {
    const {setCurrentDevice, setDevices, devices, currentDevice, setViewableDevices, viewableDevices} = useContext(DeviceContext);
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [deviceType, setDeviceType] = useState('Phone')
    const { token } = useContext(SessionContext);
    const listPress = (text) =>{
        setDeviceType(text);
        setShowTypeMenu(false);
    }
    const addDevice = async () => {
        if(deviceName.length > 0){
            let dn = [];
            if(devices.length > 0){
                for(const dname of devices){
                    dn.push(dname.deviceName);
                }
            }
            if (dn.indexOf(deviceName) === -1){
            try{
                let res = await axios.post(`http://192.168.2.207:3001/api/device`, {"deviceName":deviceName, type: deviceType}, {
                    headers: {'token': token}
                    });
                console.log(res.data);
                setCurrentDevice(res.data.id);
                await AsyncStorage.setItem('currentDevice', res.data.id);
    
                let devicesUpdated =  Object.assign([],devices);
                devicesUpdated.push({id: res.data.id, deviceName: res.data.device, type: res.data.type});
                setDevices(devicesUpdated);
                let viewableDevicesAdd = viewableDevices;
                viewableDevicesAdd.push(res.data.id);
                setViewableDevices(viewableDevicesAdd);
                await AsyncStorage.setItem('devices', JSON.stringify(devicesUpdated));
                await AsyncStorage.setItem('viewableDevices', JSON.stringify(viewableDevicesAdd));
                console.log(res.data)
                //notification("Device", "A new device was added");
                //onClose();
            }catch(err){
                //notification("Device", "Failed to add a device", 'error');
            }
            }else {
            //notification("Device", "Name taken", "error");
            }
        } else {
            //notification("Device", "Name too short", "error");
        }
    }
    return(
        <>
        <TextInput 
            label="Device name" 
            onChangeText={text => setDeviceName(text)} 
            style={{ margin: 16 }} />
        <Button
            title={`Select Device Type: ${deviceType}`}
            style={{ margin: 16 }}
            onPress={() => setShowTypeMenu(true)}
        />
        <Dialog visible={showTypeMenu} onDismiss={() => setShowTypeMenu(false)}>
            <DialogContent>
            <Stack spacing={3}>
                <ListItem title="Phone" onPress={() => listPress("Phone")} />
                <ListItem title="Tablet" onPress={() => listPress("Tablet")} />
                <ListItem title="Browser" onPress={() => listPress("Browser")} />
                <ListItem title="Desktop" onPress={() => listPress("Desktop")} />
                <ListItem title="IoT" onPress={() => listPress("IoT")} />
                <ListItem title="Other" onPress={() => listPress("Other")}/>
            </Stack>
            </DialogContent>
        </Dialog>
        <HStack center={true}>
            <Button
                title="Add device"
                onPress={addDevice}
                style={{ margin: 16 }}
            />
            <Button
                title="Cancel"
                style={{ margin: 16 }}
            />
        </HStack>
        </>
    )
}

const AddDevice = () => (
    <Provider>
      <AddDeviceAction />
    </Provider>
  );

export default AddDevice;