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
    Center,
    Spacer,
    MenuDivider,
    Input,
    Divider,
    Stack,
    useDisclosure,
    Icon,
    HStack,
  } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { notification } from "./notification";


const DeviceSelector = (props) => {

    const [openMenu, setOpenMenu] = useState(false)
    const [menuDevices, setMenuDevices] = useState()
    const { token,  sessionStatus} = useContext(SessionContext);
    const { devices, setDevices, currentDevice, setCurrentDevice} = useContext(DeviceContext);
    let offset = (props.type === "submenu") ? [200,0]: [0,0];
    const MenuDevices = async () => {
      if(devices.constructor === Array){
        setMenuDevices( devices.map((device) => 
            <MenuItemOption onClick={() => deviceSelected(device.id)}   
                            key={`device-${device.id}`}
                            closeOnSelect={true}
                            value={device.id}>
                      {device.deviceName}
            </MenuItemOption>)
        );
      }
    };
    useEffect(() => {
      MenuDevices();
    },[devices]);
    
    const deviceSelected = (deviceName) => {
      localStorage['currentDevice'] = deviceName;
      setCurrentDevice(deviceName);
      setOpenMenu(false);
    } 
    const openIt = () => {
      if(openMenu){
        setOpenMenu(false);
      }else{
        setOpenMenu(true);
      }
    }

    const MenuOpener = () => {
      if(props.type==="submenu"){
        return (
          <MenuButton as={Text} onClick={openIt} >
              Select a Device        <ChevronRightIcon/>
          </MenuButton>
        )
      }
      return(
            <MenuButton as={Button} rightIcon={<ChevronDownIcon/>} onClick={openIt} >
              Select a Device
            </MenuButton>
      )
    }
    
    return (
        <Menu offset={offset} isOpen={openMenu} closeOnBlur={openMenu}>
        <MenuOpener/>
        <MenuList>
          <MenuOptionGroup title='Devices' type='radio' defaultValue={currentDevice} >
              {menuDevices}
          </MenuOptionGroup>
        </MenuList>
        </Menu>
    )
}

export default DeviceSelector;