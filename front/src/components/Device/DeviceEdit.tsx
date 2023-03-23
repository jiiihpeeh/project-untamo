import React, { useRef, useState, useEffect } from "react"
import { Menu, MenuItem,  MenuList, MenuButton,
         Button, Divider, Input, Stack, Modal,
         ModalOverlay, ModalContent,
         ModalHeader,  ModalFooter,
         ModalBody, ModalCloseButton} from '@chakra-ui/react'         
import { ChevronDownIcon } from "@chakra-ui/icons"
import { usePopups , useDevices } from "../../stores"
import { DeviceType, Device } from "../../type"
import { isEqual } from "../../utils"

const DeviceEdit = () => {
    const [ deviceEditInfo, setDeviceEditInfo ] = useState<Device>({id:'', deviceName:'', type:DeviceType.Browser})
    const deviceEdit  = useDevices((state)=> state.editDevice)
    const setShowEdit = usePopups((state)=> state.setShowEditDevice)
    const showEdit = usePopups((state)=> state.showEditDevice)
    const setToEdit = useDevices((state) => state.setToEdit) 
    const toEditDevice = useDevices((state)=> state.toEdit)
    const inputTime = useRef<number>(Date.now())
    const types = Object.values(DeviceType).filter((item) => item)

    const mouseSelect = (e:number) =>{
      const now = Date.now()
      if(now - inputTime.current  < 200){
          return
      }
      inputTime.current = now
      let index = types.indexOf(deviceEditInfo.type)
      if( e < 0 && index +1 < types.length){
        setDeviceEditInfo({...deviceEditInfo, type: types[index + 1]})
      }
      if( e > 0 && index > 0){
        setDeviceEditInfo({...deviceEditInfo, type: types[index - 1]})
      }
    } 
    const menuActionItems = () => {
      return types.map(type =>{
                                return (
                                          <MenuItem
                                            onClick={()=>{setDeviceEditInfo({...deviceEditInfo, type: type})}}
                                            key={`edit-${type}`}
                                          >
                                            {type}
                                          </MenuItem>
                                      )
                              }
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
        setDeviceEditInfo(toEditDevice)
      }
    },[toEditDevice])
    return (
              <Modal 
                blockScrollOnMount={false} 
                isOpen={showEdit} 
                onClose={()=>cancelEdit()}
                isCentered
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    Edit Device
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
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
                          onWheel={e=>mouseSelect(e.deltaY)}
                        >
                          Device type: {deviceEditInfo.type}
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
                      onClick={()=>cancelEdit()}
                    >
                      Cancel
                    </Button>
                    <Button 
                      colorScheme='blue' 
                      onClick={(e) =>requestDeviceEdit(e)}
                      isDisabled={isEqual(toEditDevice, deviceEditInfo)}
                    >
                      Edit
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
        )
  }
  
export default DeviceEdit