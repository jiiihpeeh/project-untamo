import React, { useRef, useState, useEffect } from "react"

import { 
        Menu, MenuItem,
        MenuList, MenuButton,
        Drawer, DrawerOverlay,
        DrawerContent, DrawerHeader,
        DrawerBody, DrawerFooter,
        DrawerCloseButton, Button, Divider,
        Input, Stack } from "@chakra-ui/react"
import { ChevronDownIcon } from "@chakra-ui/icons"
import { usePopups , useDevices } from "../../stores"
import { DeviceType, Device } from "../../type.d"


const DeviceEdit = () => {
    const btnRef = useRef<HTMLButtonElement>(null)
    
    const [ deviceEditInfo, setDeviceEditInfo ] = useState<Device>({id:'', deviceName:'', type:DeviceType.Browser})
    const deviceEdit  = useDevices((state)=> state.editDevice)
    
    const setShowEdit = usePopups((state)=> state.setShowEditDevice)
    const showEdit = usePopups((state)=> state.showEditDevice)
    const setToEdit = useDevices((state) => state.setToEdit) 
    const toEditDevice = useDevices((state)=> state.toEdit)
    
    interface ActionItem{
      deviceType : DeviceType
    }
    const MenuActionItem = (item: ActionItem) => {
      return(
        <MenuItem  
          onClick={() => setDeviceEditInfo({...deviceEditInfo, type: item.deviceType})} 
          key={`type-${item.deviceType}`}
        > 
          {item.deviceType}
        </MenuItem>
      )
    }
    const cancelEdit = () => {
      setShowEdit(false)
      setToEdit(null)
    }
    const requestDeviceEdit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.currentTarget.disabled = true
      if(toEditDevice && deviceEditInfo){
        deviceEdit(deviceEditInfo.id ,deviceEditInfo.deviceName, deviceEditInfo.type)
      }
      setShowEdit(false)
    }
    useEffect(()=>{
      if(toEditDevice){
        setDeviceEditInfo({
                          deviceName: toEditDevice.deviceName,
                          type: toEditDevice.type,
                          id: toEditDevice.id
                      })
      }
    },[toEditDevice])
    return (
          <>
            <Drawer
              isOpen={showEdit}
              placement='right'
              onClose={()=>cancelEdit()}
              finalFocusRef={btnRef}
              key='xs'
              id="Device-EditDrawer"
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
                    value={deviceEditInfo.deviceName} 
                    onChange={(event) => setDeviceEditInfo({...deviceEditInfo, deviceName: event.target.value})}
                  />
                  <Divider orientation='vertical'/>
                  <Menu
                    matchWidth={true}
                  >
                    <MenuButton 
                      as={Button} 
                      rightIcon={<ChevronDownIcon />}
                    >
                      Device type: {deviceEditInfo.type}
                    </MenuButton>
                    <MenuList>
                    <MenuActionItem 
                      deviceType={DeviceType.Browser}
                    />
                    <MenuActionItem 
                      deviceType={DeviceType.Phone}
                    />
                    <MenuActionItem 
                      deviceType={DeviceType.Desktop}
                    />
                    <MenuActionItem 
                      deviceType={DeviceType.Tablet}
                    />
                    <MenuActionItem 
                      deviceType={DeviceType.IoT}
                    />
                    <MenuActionItem 
                      deviceType={DeviceType.Other}
                    />
                  </MenuList>
                  </Menu>
                  </Stack>
                </DrawerBody>
  
                <DrawerFooter>
                  <Button 
                    variant='outline' 
                    mr={3} 
                    onClick={()=>cancelEdit()}
                  >
                    Cancel
                  </Button>
                  <Button 
                    colorScheme='blue' 
                    onClick={(e) =>requestDeviceEdit(e)}
                  >
                    Edit
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </>
        )
  }
  
export default DeviceEdit