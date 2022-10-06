import { useState, useEffect, useRef } from "react";
import { useDisclosure } from '@chakra-ui/react'
import axios from "axios";


import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
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
    Input
  } from '@chakra-ui/react'
  import { ChevronDownIcon } from '@chakra-ui/icons'


const DeviceMenu = (props) => {
    return (
        <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {props.name}
        </MenuButton>
        <MenuList>
            <MenuDivider/>
            <MenuItem><AddDeviceDrawer/></MenuItem>
        </MenuList>
        </Menu>
    )
}

const AddDeviceDrawer = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = useRef()
    return (
        <>
          <Button ref={btnRef} colorScheme='teal' onClick={onOpen}>
            Add a device
          </Button>
          <Drawer
            isOpen={isOpen}
            placement='right'
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Insert Device Name</DrawerHeader>
    
              <DrawerBody>
                <Input placeholder='Device name' />
              </DrawerBody>
    
              <DrawerFooter>
                <Button variant='outline' mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme='blue'>Save</Button>
                
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )
}

const DeviceSelector = () => {

    const [devices, setDevices] = useState([]) 

    // useEffect(() => {

    // })
    

    return (
        <>
            <DeviceMenu name="Select a Device" />
        </>
    )
}

export default DeviceSelector;