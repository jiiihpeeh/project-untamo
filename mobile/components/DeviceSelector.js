import { useState, useEffect, useContext, createRef } from "react";
//import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../context/DeviceContext";

import { Dropdown, Button, Text } from "react-native-magnus";
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeviceSelector = (props) => {

    const [openMenu, setOpenMenu] = useState(false)
    const [menuDevices, setMenuDevices] = useState(null)
    const { devices, currentDevice, setCurrentDevice} = useContext(DeviceContext);


    // useEffect(() => {
    //   const generateMenu = () => {
    //     let menuDevs = [];
    //     if(devices){
    //       for(const device of devices){
    //         menuDevs.push(
    //           <Dropdown.Option>
    //             device.deviceName
    //           </Dropdown.Option>
    //         )
    //       }
    //       if(menuDevs && menuDevs.length > 0){
    //         console.log(menuDevs)
    //         setMenuDevices(menuDevs)
    //       }else{
    //         setMenuDevices([])
    //       }
    //     }
    //   }
    //   generateMenu();
    // },[devices])
    
    const dropdownRef = createRef();
    
    return (<>
          <Button
            block
            mt="sm"
            p="md"
            color="white"
            onPress={() => dropdownRef.current.open()}>
            Open Dropdown
          </Button>

          <Dropdown
            ref={dropdownRef}
            title={
              <Text mx="xl" color="gray500" pb="md">
                This is your title
              </Text>
            }
            mt="md"
            pb="2xl"
            showSwipeIndicator={true}
            roundedTop="xl">
            {/* {menuDevices} */}
           <Button>Add a device</Button>
          </Dropdown>
        </>
    )
}

export default DeviceSelector;