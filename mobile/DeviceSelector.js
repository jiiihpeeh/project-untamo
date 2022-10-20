import { useState, useEffect, useContext } from "react";
//import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "./contexts/DeviceContext";

import { 
    Provider,
    Stack,
    Button,
    Dialog,
    DialogContent,
    ListItem} from '@react-native-material/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeviceSelectorAction = (props) => {

    const [openMenu, setOpenMenu] = useState(false)
    const [menuDevices, setMenuDevices] = useState()
    const { devices, currentDevice, setCurrentDevice} = useContext(DeviceContext);

    useEffect(() => {
      const deviceSelected = async (deviceName) => {
        await AsyncStorage.setItem('currentDevice',deviceName);
        setCurrentDevice(deviceName);
        setOpenMenu(false);
      } 
      const MenuDevices = async () => {
        if(devices.constructor === Array){
          setMenuDevices( devices.map((device) => 
                <ListItem onPress={() => deviceSelected(device.id)}   
                        title={device.deviceName}
                />)
          );
        }
      };
      MenuDevices();
    },[devices, setCurrentDevice]);
    
    
    
    return (<>
        <Button
            title={`Select Device`}
            style={{ margin: 16 }}
            onPress={() => setOpenMenu(true)}
        />
        <Dialog visible={openMenu} onDismiss={() => setOpenMenu(false)}>
            <DialogContent>
            <Stack spacing={3}>
                {menuDevices}
            </Stack>
            </DialogContent>
        </Dialog>
        </>
    )
}


const DeviceSelector = () => (
    <Provider>
      <DeviceSelectorAction />
    </Provider>
  );
export default DeviceSelector;