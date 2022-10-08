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
    Input
  } from '@chakra-ui/react'
  import { ChevronDownIcon } from '@chakra-ui/icons'



const AddDeviceDrawer = () => {
  const { token } = useContext(SessionContext);
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()
  const [ deviceName, setDeviceName ] = useState('')
  const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);


  const onChange = (event) => {
      setDeviceName(event.target.value)
  }
  const requestDevice = async () => {
    try{
      let res = await axios.post(`http://localhost:3001/api/device`, {"deviceName":deviceName}, {
            headers: {'token': token}
          });
      console.log(res.data);
      setCurrentDevice(res.data.id)
      setDevices( () => {
        return [ ...devices, res.data ]
      })
    }catch(err){}
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
                <Input placeholder='Device name' text={navigator.userAgent}  value={deviceName} onChange={onChange}/>
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