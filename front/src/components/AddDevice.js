import { useState, useRef, useContext } from "react";
import { useDisclosure } from '@chakra-ui/react'
import axios from "axios";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Button, Menu,
    MenuButton,
    MenuList,MenuItem,
    Input, Divider,
    Stack,Text
  } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons';
import { notification } from "./notification";


const AddDevice = (props) => {
  const { token, server } = useContext(SessionContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const [ deviceName, setDeviceName ] = useState('');
  const { setCurrentDevice, devices, setDevices, viewableDevices, setViewableDevices  } = useContext(DeviceContext);
  const [deviceType, setDeviceType] = useState('Browser');

  const onChange = (event) => {
      setDeviceName(event.target.value);
  }
  const MenuActionItem = (text) => {
    return(
      <MenuItem  onClick={() => setDeviceType(text.text)} key={`type-${text.text}`}> {text.text}</MenuItem>
    )
  };

  const requestDevice = async (event) => {
    event.currentTarget.disabled = true;
    if(deviceName.length > 0){
      let dn = [];
      if(devices.length > 0){
        for(const dname of devices){
          dn.push(dname.deviceName);
        }
      }
      if (dn.indexOf(deviceName) === -1){
        try{
          let res = await axios.post(`${server}/api/device`, {"deviceName":deviceName, type: deviceType}, {
                headers: {'token': token}
              });
          console.log(res.data);
          setCurrentDevice(res.data.id);
          localStorage['currentDevice'] = res.data.id;

          let devicesUpdated =  Object.assign([],devices);
          devicesUpdated.push({id: res.data.id, deviceName: res.data.device, type: res.data.type});
          setDevices(devicesUpdated);
          let viewableDevicesAdd = viewableDevices;
          viewableDevicesAdd.push(res.data.id);
          setViewableDevices(viewableDevicesAdd);
          localStorage['devices'] = JSON.stringify(devicesUpdated);
          localStorage['viewableDevices'] = JSON.stringify(viewableDevicesAdd);
          notification("Device", "A new device was added");
          onClose();
        }catch(err){
          notification("Device", "Failed to add a device", 'error');
        }
      }else {
        notification("Device", "Name taken", "error");
      }
    } else {
      notification("Device", "Name too short", "error");
    }
  }

  const AddItem = () => {
    if(props.open !== "menu"){
      return(
        <Button ref={btnRef} colorScheme='teal' onClick={onOpen} id="add-device-button" >
          Add a device
        </Button>
      )}
      return(
          <>
            <Text ref={btnRef} colorScheme='teal' onClick={onOpen} id="add-device-button" >
              Add a device
            </Text>
          </>
      )
  }
  return (
        <>
          <AddItem/>
          <Drawer
            isOpen={isOpen}
            placement='right'
            onClose={onClose}
            finalFocusRef={btnRef}
            key='xs'
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Insert Device Name</DrawerHeader>
    
              <DrawerBody>
                <Stack>
                <Input placeholder='Device name'  value={deviceName} onChange={onChange}/>
                <Divider orientation='vertical'/>
                <Menu>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                    Device type: {deviceType}
                  </MenuButton>
                  <MenuList>
                    <MenuActionItem text="Browser"/>
                    <MenuActionItem text="Phone"/>
                    <MenuActionItem text="Desktop"/>
                    <MenuActionItem text="Tablet" />
                    <MenuActionItem text="IoT"/>
                    <MenuActionItem text="Other"/>
                  </MenuList>
                </Menu>
                </Stack>
              </DrawerBody>
              <DrawerFooter>
                <Button variant='outline' mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme='blue' onClick={requestDevice}>Add</Button>
                
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )
};

export default AddDevice;