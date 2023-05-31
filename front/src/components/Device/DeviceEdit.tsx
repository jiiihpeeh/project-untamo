import React, { useRef, useState, useEffect } from "react"
import { Menu, MenuItem,  MenuList, MenuButton,
         Button, Divider, Input, Stack, Modal,
         ModalOverlay, ModalContent,
         ModalHeader,  ModalFooter,
         ModalBody, ModalCloseButton, HStack} from '@chakra-ui/react'         
import { ChevronDownIcon as Down } from "@chakra-ui/icons"
import { usePopups , useDevices } from "../../stores"
import { DeviceType, Device } from "../../type"
import { isEqual } from "../../utils"
import Picker from '@emoji-mart/react'
import  useSettings  from "../../stores/settingsStore"
import useEmojiStore, { Skin } from "../../stores/emojiStore"


function DeviceEdit() {
  const [deviceEditInfo, setDeviceEditInfo] = useState<Device>({ id: '', deviceName: '', type: DeviceType.Browser })
  const deviceEdit = useDevices((state) => state.editDevice)
  const setShowEdit = usePopups((state) => state.setShowEditDevice)
  const showEdit = usePopups((state) => state.showEditDevice)
  const setToEdit = useDevices((state) => state.setToEdit)
  const toEditDevice = useDevices((state) => state.toEdit)
  const inputTime = useRef<number>(Date.now())
  const types = Object.values(DeviceType).filter((item) => item)
  const [ showEmoji, setShowEmoji ]  = useState(false)
  const isLight = useSettings((state)=>state.isLight)
  const data = useEmojiStore((state)=>state.getEmojiData)()

  function onEmojiSelect(emoji: Skin) {
    setDeviceEditInfo({ ...deviceEditInfo, deviceName: deviceEditInfo.deviceName+emoji.native })
  }

  function mouseSelect(e: number) {
    const now = Date.now()
    if (now - inputTime.current < 200) {
      return
    }
    inputTime.current = now
    let index = types.indexOf(deviceEditInfo.type)
    if (e < 0 && index + 1 < types.length) {
      setDeviceEditInfo({ ...deviceEditInfo, type: types[index + 1] })
    }
    if (e > 0 && index > 0) {
      setDeviceEditInfo({ ...deviceEditInfo, type: types[index - 1] })
    }
  }
  function menuActionItems() {
    return types.map(type => {
      return (
        <MenuItem
          onClick={() => { setDeviceEditInfo({ ...deviceEditInfo, type: type }) } }
          key={`edit-${type}`}
        >
          {type}
        </MenuItem>
      )
    }
    )
  }
  function cancelEdit() {
    setShowEdit(false)
    setToEdit(null)
  }
  async function requestDeviceEdit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.currentTarget.disabled = true
    if (toEditDevice && deviceEditInfo) {
      deviceEdit(deviceEditInfo.id, deviceEditInfo.deviceName, deviceEditInfo.type)
    }
    setShowEdit(false)
  }
  useEffect(() => {
    if (toEditDevice) {
      setDeviceEditInfo(toEditDevice)
    }
  }, [toEditDevice])
  return (
    <Modal
      blockScrollOnMount={false}
      isOpen={showEdit}
      onClose={() => cancelEdit()}
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
            <HStack>
              <Input
                placeholder='Device name'
                value={deviceEditInfo.deviceName}
                onChange={(event) => setDeviceEditInfo({ ...deviceEditInfo, deviceName: event.target.value })} 
              />
              <Button
                onClick={()=>setShowEmoji(!showEmoji)}
              >
                  🕰️
              </Button>
            </HStack>
            {showEmoji?
                    <Picker 
                        data={data} 
                        onEmojiSelect={onEmojiSelect}
                        theme={isLight?'light':'dark'}
                    />:<></>}
            <Divider orientation='vertical' />
            <Menu
              matchWidth={true}
            >
              <MenuButton
                as={Button}
                rightIcon={<Down />}
                onWheel={e => mouseSelect(e.deltaY)}
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
            onClick={() => cancelEdit()}
          >
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            onClick={(e) => requestDeviceEdit(e)}
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