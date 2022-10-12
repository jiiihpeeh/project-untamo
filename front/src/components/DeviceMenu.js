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
  } from '@chakra-ui/react';
import DeviceSelector from './DeviceSelector';
import { DeviceContext } from '../contexts/DeviceContext';
import { useContext, useEffect, useState } from 'react';

const DeviceMenu = () => {
    const [menuDeviceItems, setMenuDeviceItems] = useState([])

    const { currentDevice, setCurrentDevice, devices, setDevices, viewableDevices, setViewableDevices} = useContext(DeviceContext);

    const MenuDeviceView = (deviceItem) => {
        //console.log(deviceItem)
        return (<MenuItemOption value={deviceItem.children.id} key={`dev-id-${deviceItem.children.id}`}>{deviceItem.children.deviceName}</MenuItemOption>)
    }
    const menuDeviceOptions = () =>{
        let items = [];
        for (const item of devices){
            items.push(<MenuDeviceView>{item}</MenuDeviceView>);
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
            <MenuItem><DeviceSelector type="submenu"/></MenuItem>
            <MenuDivider />
            <MenuOptionGroup title='Viewable devices' type='checkbox'>
                {menuDeviceItems}
            </MenuOptionGroup>
            <MenuDivider />
            <MenuGroup title="Add a device">
                <MenuItem>Pair a device (QR code)</MenuItem>
                <MenuItem>Add a device</MenuItem>
            </MenuGroup>
        </MenuList>
        </Menu>
    )

};

export default DeviceMenu;