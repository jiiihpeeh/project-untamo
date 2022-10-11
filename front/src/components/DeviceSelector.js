import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from '@chakra-ui/react'
import axios from "axios";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import AddDevice from "./AddDevice";

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


const DeviceSelector = () => {

    const [menuDevices, setMenuDevices] = useState()
    const navigate =  useNavigate()
    const { token,  sessionStatus} = useContext(SessionContext);
    const { devices, setDevices, currentDevice, setCurrentDevice} = useContext(DeviceContext);

    const MenuDevices = async () => {
      setMenuDevices( devices.map((device) => 
          <MenuItem onClick={() => deviceSelected(device.id)}   key={`device-${device.id}`}> {device.deviceName}</MenuItem>)
      );
    };
    useEffect(() => {
      MenuDevices();
    },[devices]);
    
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
          {/* <MenuDivider/>
          <MenuItem key="device-drawer"><AddDevice/></MenuItem> */}
        </MenuList>
        </Menu>
    )
}

export default DeviceSelector;