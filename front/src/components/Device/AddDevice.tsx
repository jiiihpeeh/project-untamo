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
  const btnRef = useRef<any>(null)
  const [ deviceName, setDeviceName ] = useState('')
  const addDevice = useDevices((state) => state.addDevice)
  const [deviceType, setDeviceType] = useState(DeviceType.Browser)
  const showAddDevice = usePopups((state)=> state.showAddDevice)
  const setShowAddDevice = usePopups((state)=> state.setShowAddDevice)
  const inputTime = useRef<number>(Date.now())
  const types = Object.values(DeviceType).filter((item) => item)

  const mouseSelect = (e:number) =>{
    const now = Date.now()
    if(now - inputTime.current  < 80){
        return
    }
    inputTime.current = now
    let index = types.indexOf(deviceType)
    if( e < 0 && index +1 < types.length){
      setDeviceType(types[index + 1])
    }
    if( e > 0 && index > 0){
      setDeviceType(types[index - 1])
    }
  } 
  const menuActionItems = () => {
    return types.map(type =>{
                              return (
                                        <MenuItem
                                          onClick={()=>{setDeviceType(type)}}
                                          key={`add-${type}`}
                                        >
                                          {type}
                                        </MenuItem>
                                    )
                            }
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
                    onWheel={e=>mouseSelect(e.deltaY)}
                  >
                    Device type: {deviceType}
                  </MenuButton>
                  <MenuList>
                    {menuActionItems()}
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