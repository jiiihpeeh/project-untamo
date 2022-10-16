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

    const [openMenu, setOpenMenu] = useState(false)
    const [menuDevices, setMenuDevices] = useState()
    const { token,  sessionStatus} = useContext(SessionContext);
    const { devices, setDevices, currentDevice, setCurrentDevice} = useContext(DeviceContext);
    let menuIcon = (props.type === "submenu")? <ChevronRightIcon/> :<ChevronDownIcon/>
    let offset = (props.type === "submenu") ? [200,0]: [0,0]
    const MenuDevices = async () => {
      if(devices.constructor === Array){
        setMenuDevices( devices.map((device) => 
            <MenuItemOption onClick={() => deviceSelected(device.id)}   
                            key={`device-${device.id}`}
                            closeOnSelect={true}>
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
          <MenuButton as={Text} rightIcon={menuIcon}  onClick={openIt} >
            Select a Device <ChevronRightIcon/>
          </MenuButton>
        )
      }
      return(
            <MenuButton as={Button} rightIcon={menuIcon} onClick={openIt} >
              Select a Device
            </MenuButton>
      )
    }
    
    return (
        <Menu offset={offset} isOpen={openMenu} closeOnBlur={openMenu}>
        <MenuOpener/>
        <MenuList>
          <MenuOptionGroup title='Devices'>
              {menuDevices}
          </MenuOptionGroup>
        </MenuList>
        </Menu>
    )
}

export default DeviceSelector;