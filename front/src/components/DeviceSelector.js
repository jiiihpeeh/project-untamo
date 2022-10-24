import { useState, useEffect, useContext } from "react";
//import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";

import {
    Button, 
    Text,   
    Menu,
    MenuButton,
    MenuList,
    MenuItemOption,
    MenuOptionGroup,
    Icon,
    HStack,
    Tooltip,
    Radio,
    Spacer,
    Box
  } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import deviceIcons from "./DeviceIcons";

const DeviceSelector = (props) => {

    const [openMenu, setOpenMenu] = useState(false)
    const [menuDevices, setMenuDevices] = useState()
    const { devices, currentDevice, setCurrentDevice} = useContext(DeviceContext);
    let offset = (props.type === "submenu") ? [200,0]: [0,0];


    useEffect(() => {
      const isCurrentDevice = (id) =>{
        if(currentDevice){
          return currentDevice === id;
        }
        return false;
      }
      const deviceSelected = (deviceName) => {
        localStorage['currentDevice'] = deviceName;
        setCurrentDevice(deviceName);
        setOpenMenu(false);
      } 
      const MenuDevices = async () => {
        if(devices.constructor === Array){
          setMenuDevices( devices.map((device) => 
            <Tooltip label={device.type} key={`tooltip-${device.id}`}>
              <MenuItemOption onClick={() => deviceSelected(device.id)}   
                              key={`device-${device.id}`}
                              closeOnSelect={true}
                              value={device.id}>
                        
                        <HStack spacing='24px'>
                        
                          <Radio  isChecked={isCurrentDevice(device.id)}> {device.deviceName}</Radio> <Tooltip label={device.type}><Icon as={deviceIcons(device.type)}/></Tooltip>
                        
                        </HStack>
                        
                        
              </MenuItemOption>
              </Tooltip>)
          );
        }
      };
      MenuDevices();
    },[devices, setCurrentDevice, currentDevice]);
    

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
              <HStack spacing='36px' > <Box><Text>Select a Device </Text> </Box><Spacer /> <Box><ChevronRightIcon/></Box></HStack>
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