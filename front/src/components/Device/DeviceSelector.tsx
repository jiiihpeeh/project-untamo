import React, { useState, useEffect, useRef } from "react"
import { Button, Text, Menu, MenuButton, MenuList,
         MenuItemOption, MenuOptionGroup, Icon, 
         HStack, Tooltip, Radio,Spacer, Box,usePopper } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import DeviceIcons from "./DeviceIcons"
import { useDevices, usePopups } from "../../stores"
import { Device } from "../../vite-env"
import { MenuType } from "../../stores/popUpStore"


const DeviceSelector = () => {
  const devices = useDevices((state)=> state.devices)
  const currentDevice = useDevices((state)=> state.currentDevice)
  const setCurrentDevice = useDevices((state)=> state.setCurrentDevice)
  const showDeviceSelector = usePopups((state)=> state.showDeviceSelector)
  const setShowDeviceSelector = usePopups((state)=> state.setShowDeviceSelector)
  //const element = document.getElementById(showDeviceSelector.id)
  
  const isCurrentDevice = (device: Device) =>{
    if(currentDevice){
      return currentDevice === device.id
    }
    return false
  }
  const closeMenu = () => {
    setShowDeviceSelector(false, "Device-selector", MenuType.Menu)
  }
  const deviceSelected = (device: Device) => {
    setCurrentDevice(device.id)
    closeMenu()
  } 


  const MenuDevices =  () => {
      return devices.map((device) => {
                                      return(
                                          <Tooltip 
                                            label={device.type} 
                                            key={`tooltip-${device.id}`}
                                          >
                                            <MenuItemOption 
                                                onClick={() => deviceSelected(device)}   
                                                key={`menu-device-${device.id}`}
                                                closeOnSelect={true}
                                                value={device.id}
                                            >          
                                                <HStack 
                                                  spacing='24px'>
                                                    <Radio  
                                                      isChecked={isCurrentDevice(device)}> 
                                                        {device.deviceName}
                                                    </Radio> 
                                                  <DeviceIcons device={device.type}/>
                                                </HStack>
                                            </MenuItemOption>
                                          </Tooltip>
                                        )
                                      }
                        )
  }

    
    return (
        <Menu 
          isOpen={showDeviceSelector.show}
          id="DeviceSelector"
        >
          <MenuButton
            as={Box}
            style={showDeviceSelector.style}
            h="0px"
          >
          </MenuButton>
          {/* <MenuOpener/> */}
          <MenuList
          		onMouseLeave={() =>{addEventListener("click", closeMenu,{once:true})}}
          >
            <MenuOptionGroup 
                title='Devices'
                type='radio' 
                defaultValue={currentDevice?currentDevice:''} 
            >
                {MenuDevices()}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
    )
}

export default DeviceSelector