import { useState, useEffect, useContext, createRef, } from "react";
//import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../context/DeviceContext";

import { Select, Button, Text , Dropdown} from "react-native-magnus";
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeviceSelector = (props) => {

    const [openMenu, setOpenMenu] = useState(false)
    const [menuDevices, setMenuDevices] = useState([])
    const { devices, currentDevice, setCurrentDevice} = useContext(DeviceContext);
    
    const [selectValue, setSelectedValue] = useState([]);
    const dropdownRef = createRef();    
    const onSelectOption = () =>{
      console.log(devices)
      console.log("hei");
    }
    useEffect(() =>{
      const DeviceMap = () => {
        let devs = []
        for(const device of devices){
          devs.push(<Dropdown.Option 
                      onPress={() => {setCurrentDevice(device.id); 
                                      AsyncStorage.setItem('currentDevice',JSON.stringify(device.id))}}
                      key={`select-${device.id}`}
                                    >
                  <Text> {device.deviceName} {device.type}</Text>
                </Dropdown.Option>)
        }
        setMenuDevices(devs)
      }
    DeviceMap()
    },[devices])
    return (
        <>
        <Button
          block
          bg="teal"
          p="md"
          color="white"
          m={20}
          mt={10}
          mb={10}
          mr={20}
          onPress={() => dropdownRef.current.open()}>
          Select a device
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
          {menuDevices}
        </Dropdown>
      </>
    )
}
export default DeviceSelector;