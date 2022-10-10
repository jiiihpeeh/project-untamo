import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
    Button, 
    Text,   
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
    Input,
    Divider,
    Stack
  } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { notification } from "./notification";


const AddDeviceDrawer = () => {
  const { token } = useContext(SessionContext);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()
  const [ deviceName, setDeviceName ] = useState('')
  const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
  const [deviceType, setDeviceType] = useState('Browser')

  const navigate = useNavigate()
  const onChange = (event) => {
      setDeviceName(event.target.value)
  }
  const MenuActionItem = (text) => {
    return(
      <MenuItem  onClick={() => setDeviceType(text.text)} > {text.text} </MenuItem>
    )
  }

  const requestDevice = async () => {
    if(deviceName.length > 0){
      let dn = []
      if(devices.length > 0){
        for(const dname of devices){
          dn.push(dname.deviceName)
        }
      }
      if (dn.indexOf(deviceName) === -1){
        try{
        
          let res = await axios.post(`/api/device`, {"deviceName":deviceName, type: deviceType}, {
                headers: {'token': token}
              });
          console.log(res.data);
          setCurrentDevice(res.data.id)
          localStorage['currentDevice'] = res.data.id

          let devicesUpdated =  Object.assign([],devices)
          devicesUpdated.push({id: res.data.id, deviceName: res.data.device, type: res.data.type})
          setDevices(devicesUpdated)
          localStorage['devices'] = JSON.stringify(devicesUpdated)
          notification("Device", "A new device was added")
          navigate('/alarms')
        }catch(err){
          notification("Device", "Failed to add a device", 'error')
        }
      }else {
        notification("Device", "Name taken", "error")
      }
    } else {
      notification("Device", "Name too short", "error")
    } 
  }
  return (
        <>
          <Button ref={btnRef} colorScheme='teal' onClick={onOpen}>
            Add a device
          </Button>
          <Drawer
            isOpen={isOpen}
            placement='right'
            onClose={onClose}
            finalFocusRef={btnRef}
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
                    <MenuActionItem text="Tablet"/>
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
}

const DeviceSelector = () => {

    const [devices, setDevices] = useState([]) 
    const [menuDevices, setMenuDevices] = useState()
    const navigate =  useNavigate()
    const { token } = useContext(SessionContext);
    const { currentDevice, setCurrentDevice} = useContext(DeviceContext);

    const fetchDevices = async () => {
      let fetchedDevices = []
      try{
        let res = await axios.get(`/api/devices`,{
        headers: {'token': token}
        });
        localStorage['devices'] = JSON.stringify(res.data);
        fetchedDevices = res.data;
      }catch(err){
        console.log("Cannot fetch devices online");
        if (localStorage.getItem('devices') !== null){
          fetchedDevices = JSON.parse(localStorage['devices']);
        }
      }
      
      setDevices(fetchedDevices);
      setMenuDevices( fetchedDevices.map((device) => 
          <MenuItem onClick={() => deviceSelected(device.id)}> {device.deviceName}</MenuItem>)
      );
    };
    useEffect(() => {
      fetchDevices();

    },[]);
    
    const deviceSelected = (deviceName) => {
      localStorage['currentDevice'] = deviceName;
      setCurrentDevice(deviceName);
      navigate('/alarms');
    } 


    return (
        <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Select a Device
        </MenuButton>
        <MenuList>
          <MenuGroup title='Devices'>
              {menuDevices}
          </MenuGroup>
          <MenuDivider/>
          <MenuItem><AddDeviceDrawer/></MenuItem>
        </MenuList>
        </Menu>
    )
}

export default DeviceSelector;