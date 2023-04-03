import React, { useState, useRef } from "react"
import { Menu, MenuItem,  MenuList, MenuButton,
  Button, Divider,
  Input, Stack, Modal,
   ModalOverlay, ModalContent,
   ModalHeader,  ModalFooter,
   ModalBody, ModalCloseButton
 } from '@chakra-ui/react'  
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
    if(now - inputTime.current  < 200){
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
  const onModalClose = () => {
    setShowAddDevice(false)
  }

  return (
          <Modal
            isOpen={showAddDevice}
            isCentered
            onClose={onModalClose}
            finalFocusRef={btnRef}
            key='xs'
          >
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalHeader
                onMouseDown={e=>e.preventDefault()}
              >
                Insert Device Name
              </ModalHeader>
              <ModalBody>
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
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant='outline' 
                  mr={3} 
                  onClick={onModalClose}
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme='blue' 
                  onClick={(e) =>{requestDevice(e)}}
                >
                  Add
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
      )
}

export default AddDevice