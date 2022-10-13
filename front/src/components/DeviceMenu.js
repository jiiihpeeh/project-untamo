import {
    Link, 
    Text,   
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
    Input,
    Divider,
    Stack,
    IconButton,
    Spacer,
    Flex,
    Checkbox
  } from '@chakra-ui/react';
import { EditIcon} from '@chakra-ui/icons';
import DeviceSelector from './DeviceSelector';
import { DeviceContext } from '../contexts/DeviceContext';
import { useContext, useEffect, useState } from 'react';
import QRPairingDialog from './QRPairingDialog';
const DeviceMenu = () => {
    const [menuDeviceItems, setMenuDeviceItems] = useState([])

    const { currentDevice, setCurrentDevice, devices, setDevices, viewableDevices, setViewableDevices} = useContext(DeviceContext);
    const EditDevice = (device) =>{
        console.log(device)
    }
    const MenuDeviceView = (deviceItem) => {
        return (<MenuItemOption value={deviceItem.id} id={`dev-id-${deviceItem.id}`} key={`dev-id-${deviceItem.id}`} onClick={(event) => {console.log(event)}} >
                    <Flex>
                        {deviceItem.deviceName} 
                        <Spacer/>
                        <IconButton size='xs' onClick={() => {EditDevice(deviceItem.id)}} icon={<EditIcon/>}/>
                    </Flex>
                </MenuItemOption>)
    }
    const menuDeviceOptions = () =>{
        let items = [];
        for (const item of devices){
            items.push(MenuDeviceView(item));
        }
        setMenuDeviceItems(items)
    } 
    useEffect(() => {
        menuDeviceOptions()
    },[devices])
    return(
        <Menu closeOnSelect={false}>
        <MenuButton as={Link} >
            <Text as='b'>Devices</Text>
        </MenuButton>
        <MenuList>
            <MenuItem><Flex><DeviceSelector type="submenu"/></Flex></MenuItem>
            <MenuDivider />
            <MenuOptionGroup title='Viewable devices' type='checkbox'>
                {menuDeviceItems}
            </MenuOptionGroup>
            <MenuDivider />
            <MenuGroup title="Add a device">
                <MenuItem><QRPairingDialog/></MenuItem>
                <MenuItem>Add a device</MenuItem>
            </MenuGroup>
        </MenuList>
        </Menu>
    )

};

export default DeviceMenu;