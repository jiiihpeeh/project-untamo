import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import AddDevice from "./AddDevice";

import {
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
    Stack,
    useDisclosure,
    Icon,
  } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { notification } from "./notification";


const DeviceSelector = (props) => {

    const [menuDevices, setMenuDevices] = useState()
    const { token,  sessionStatus} = useContext(SessionContext);
    const { devices, setDevices, currentDevice, setCurrentDevice} = useContext(DeviceContext);
    let menuIcon = (props.type === "submenu")? <ChevronRightIcon/> :<ChevronDownIcon/>
    let offset = (props.type === "submenu") ? [200,0]: [0,0]
    const MenuDevices = async () => {
      if(devices.constructor === Array){
        setMenuDevices( devices.map((device) => 
            <MenuItem onClick={() => deviceSelected(device.id)}   key={`device-${device.id}`}> {device.deviceName}</MenuItem>)
        );
      }
    };
    useEffect(() => {
      MenuDevices();
    },[devices]);
    
    const deviceSelected = (deviceName) => {
      localStorage['currentDevice'] = deviceName;
      setCurrentDevice(deviceName);
    } 
 
    const {onClick, onOpen} = useDisclosure()
    return (
        <Menu offset={offset}>
        <MenuButton as={Button} rightIcon={menuIcon}  >
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