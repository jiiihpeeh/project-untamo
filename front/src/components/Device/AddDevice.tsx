import React, { useState, useRef } from "react"
import {  Drawer, DrawerBody,  
          DrawerFooter, DrawerHeader,
          DrawerOverlay, DrawerContent,
          DrawerCloseButton, Button, Menu,
          MenuButton, MenuList,MenuItem,
          Input, Divider, Stack } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { useDevices, usePopups } from "../../stores"
import { DeviceType } from "../../type"

const AddDevice = () => {
  const btnRef = useRef<any>()
  const [ deviceName, setDeviceName ] = useState('')
  const addDevice = useDevices((state) => state.addDevice)
  const [deviceType, setDeviceType] = useState(DeviceType.Browser)
  const showAddDevice = usePopups((state)=> state.showAddDevice)
  const setShowAddDevice = usePopups((state)=> state.setShowAddDevice)
  interface DeviceTypeName{
    type: DeviceType
  }
  const MenuActionItem = (item: DeviceTypeName) => {
    return(
      <MenuItem  
        onClick={() => setDeviceType(item.type)} 
        key={`type-${item.type}`}
      > 
        {item.type}
      </MenuItem>
    )
  }

  const requestDevice = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.currentTarget.disabled = true
    addDevice(deviceName, deviceType)
    setShowAddDevice(false)
    setDeviceName("")
  }
  const onDrawerClose = () => {
    setShowAddDevice(false)
  }

  return (
        <>
          <Drawer
            isOpen={showAddDevice}
            placement='right'
            onClose={onDrawerClose}
            finalFocusRef={btnRef}
            key='xs'
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>
                Insert Device Name
              </DrawerHeader>
    
              <DrawerBody>
                <Stack>
                <Input 
                  placeholder='Device name'  
                  value={deviceName} 
                  onChange={(e) => {e && setDeviceName(e.target.value)}}
                />
                <Divider 
                  orientation='vertical'
                />
                <Menu
                      matchWidth={true}
                >
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                  >
                    Device type: {deviceType}
                  </MenuButton>
                  <MenuList>
                    <MenuActionItem 
                      type = {DeviceType.Browser}
                    />
                    <MenuActionItem 
                      type ={DeviceType.Phone}
                    />
                    <MenuActionItem 
                      type ={DeviceType.Desktop}
                    />
                    <MenuActionItem 
                      type ={DeviceType.Tablet}
                    />
                    <MenuActionItem 
                      type ={DeviceType.IoT}
                    />
                    <MenuActionItem 
                      type ={DeviceType.Other}
                    />
                  </MenuList>
                </Menu>
                </Stack>
              </DrawerBody>
              <DrawerFooter>
                <Button 
                  variant='outline' 
                  mr={3} 
                  onClick={onDrawerClose}
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme='blue' 
                  onClick={(e) =>{requestDevice(e)}}
                >
                  Add
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )
}

export default AddDevice