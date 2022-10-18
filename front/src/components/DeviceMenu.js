import {
    Link, 
    Text,   
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuGroup,
    MenuDivider,
    Flex,
  } from '@chakra-ui/react';
//import { EditIcon, DeleteIcon} from '@chakra-ui/icons';
import DeviceSelector from './DeviceSelector';
import { DeviceContext } from '../contexts/DeviceContext';
import { useContext, useEffect, useState } from 'react';
import QRPairingDialog from './QRPairingDialog';
import DeviceMenuActions from './DeviceMenuActions';
import AddDevice from './AddDevice';

const DeviceMenu = () => {
    const [menuDeviceItems, setMenuDeviceItems] = useState([])

    const { devices, } = useContext(DeviceContext);

    const MenuDeviceView = (deviceItem) => {
        return (<MenuItem value={deviceItem.id} id={`dev-id-${deviceItem.id}`} key={`dev-id-${deviceItem.id}`}  >
                <DeviceMenuActions device={deviceItem}/>
                </MenuItem>)
    }

    useEffect(() => {    
        const menuDeviceOptions = () =>{
            let items = [];
            for (const item of devices){
                items.push(MenuDeviceView(item));
            }
            setMenuDeviceItems(items)
        } 
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
            <MenuGroup title='Viewable devices' type='checkbox'>
                {menuDeviceItems}
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title="Add a device">
                <MenuItem><QRPairingDialog/></MenuItem>
                <MenuItem><AddDevice open="menu"/></MenuItem>
            </MenuGroup>
        </MenuList>
        </Menu>
    )

};

export default DeviceMenu;