import { useContext, useRef, useState } from "react";
import axios from "axios";
import { notification } from "./notification";
import { SessionContext } from "../contexts/SessionContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { 
        Menu, MenuItem,
        MenuList, MenuButton,
        Drawer, DrawerOverlay,
        DrawerContent, DrawerHeader,
        DrawerBody, DrawerFooter,
        DrawerCloseButton, Button, Divider,
        Input, Stack, useDisclosure
        } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

const DeviceEdit = (props) => {
    const { token, server } = useContext(SessionContext);
    const { onClose } = useDisclosure();
    const btnRef = useRef();
    const [ deviceName, setDeviceName ] = useState(props.device.deviceName);
    const { devices, setDevices } = useContext(DeviceContext);
    const [deviceType, setDeviceType] = useState(props.device.type);
  
    const onChange = (event) => {
        setDeviceName(event.target.value);
    }
    const MenuActionItem = (text) => {
      return(
        <MenuItem  onClick={() => setDeviceType(text.text)} 
                   key={`type-${text.text}`}> 
                   {text.text}
        </MenuItem>
      )
    };
    const cancelEdit = () => {
      props.setEditDialogState(false);
      onClose();
    }
    const requestDeviceEdit = async (event) => {
      event.currentTarget.disabled = true;
      if(deviceName.length > 0){
        let deviceObject = devices.filter(device => device.id === props.device.id)[0];
        let deviceMatchName = devices.filter(device => device.deviceName === deviceName);
        if (deviceMatchName.length === 0 || (deviceObject.deviceName === deviceName)){
          try{
            let res = await axios.put(`${server}/api/device/`+ props.device.id,
                      {deviceName:deviceName, type: deviceType, id: props.device.id }, 
                      {headers: {'token': token}});
            //console.log(res.data);
            let devicesUpdated =  devices.filter(device => device.id !== props.device.id);
            devicesUpdated.push({deviceName:deviceName, type: deviceType, id: props.device.id});
            setDevices(devicesUpdated);
            localStorage['devices'] = JSON.stringify(devicesUpdated);
            notification("Device", "A device was updated");
            
          }catch(err){
            notification("Device", "Failed to update a device", 'error');
          };
        }else {
          notification("Device", "Name taken", "error");
        };
      } else {
        notification("Device", "Name too short", "error");
      };
      props.setEditDialogState(false);
      onClose();
    };
    return (
          <>
            <Drawer
              isOpen={props.editDialogState}
              placement='right'
              onClose={onClose}
              finalFocusRef={btnRef}
              key='xs'
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Insert Device Name</DrawerHeader>
      
                <DrawerBody>
                  <Stack>
                  <Input placeholder='Device name'  value={deviceName} onChange={onChange}/>
                  <Divider orientation='vertical'/>
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                      Device type: {deviceType}
                    </MenuButton>
                    <MenuList>
                      <MenuActionItem text="Browser"/>
                      <MenuActionItem text="Phone"/>
                      <MenuActionItem text="Desktop"/>
                      <MenuActionItem text="Tablet" />
                      <MenuActionItem text="IoT"/>
                      <MenuActionItem text="Other"/>
                    </MenuList>
                  </Menu>
                  </Stack>
                </DrawerBody>
  
                <DrawerFooter>
                  <Button variant='outline' mr={3} onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button colorScheme='blue' onClick={requestDeviceEdit}>Edit</Button>
                  
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </>
        )
  };
  
export default DeviceEdit;