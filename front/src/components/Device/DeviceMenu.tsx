import { Link, Text,Menu, MenuButton, Box,
         MenuList, MenuItem, MenuGroup,
         MenuDivider,  MenuOptionGroup, Checkbox, IconButton,
         Tooltip, Table, Tr, Td, Tbody } from '@chakra-ui/react'
import React from 'react'
import { useDevices, usePopups } from '../../stores'
import { EditIcon, DeleteIcon, ChevronRightIcon} from '@chakra-ui/icons'
import { MenuType } from "../../stores/popUpStore"
import { Icon } from "@chakra-ui/react"
import DeviceIcons from "./DeviceIcons"

const DeviceMenu = () => {
    const viewableDevices = useDevices((state)=> state.viewableDevices)
    const toggleViewableDevices = useDevices((state)=>state.toggleViewableDevices)
    const setShowDelete = usePopups((state) => state.setShowDeleteDevice)
    const setShowEdit = usePopups((state) => state.setShowEditDevice)
    const devices = useDevices((state) => state.devices)
    const setToDelete = useDevices((state)=>state.setToDelete)
    const setToEdit = useDevices((state)=>state.setToEdit)
    const setShowAddDevice = usePopups((state)=> state.setShowAddDevice)
    const setShowDeviceMenu = usePopups((state)=> state.setShowDeviceMenu)
    const showDeviceMenu = usePopups((state)=> state.showDeviceMenu)
    const setShowQRDialog = usePopups((state)=> state.setShowQRDialog)
    const showDeviceSelector = usePopups((state)=> state.showDeviceSelector)
    const setShowDeviceSelector = usePopups((state)=> state.setShowDeviceSelector)


    const openDelete = async(value:string) => {
        let delDevice = devices.filter(dev => dev.id === value)[0]
        if(delDevice){
            //console.log(delDevice)
            setToDelete(delDevice)
            setShowDelete(true)
        }

    }
    const closeMenu = () => {
		setShowDeviceMenu(false, "userMenu", MenuType.Menu)
        setShowDeviceSelector(false, "userMenu", MenuType.Menu)
	}

    const openEdit = async(value:string) => {
        let editDevice = devices.filter(dev => dev.id === value)[0]
        if(editDevice){
            //console.log(editDevice)
            setToEdit(editDevice)
            setShowEdit(true)
        }

      }
    const deviceIsChecked = (event:React.MouseEvent<HTMLAnchorElement, MouseEvent>, ID:string) => {
        event.preventDefault()
        toggleViewableDevices(ID)
    } 
    const deviceMenu = ()=> {
        return devices.map(deviceItem => {
            let ID = deviceItem.id
            return(
                <MenuItem 
                        value={ID} 
                        id={`dev-id-${ID}`} 
                        key={`dev-id-${ID}`}  
                >
                    <Table  
                        id={`linkView-${ID}`} 
                        key={`viewedDevice-${ID}`} 
                        variant="unstyled" 
                        size="sm" 
                        mb={"0px"} 
                        mt={"0px"}
                    >
                        <Tbody>
                        <Tr>
                        <Td>
                            <Link  
                                onClick={(e)=>deviceIsChecked(e,ID)} 
                            >
                            <Checkbox
                                isChecked={viewableDevices.includes(ID)}
                            >
                            <Tooltip 
                                label={deviceItem.type} 
                                fontSize='md'
                            >
                                <Text>
                                    {deviceItem.deviceName} <DeviceIcons device={deviceItem.type}/>
                                </Text>
                            </Tooltip>
                            </Checkbox>
                            </Link>
                        </Td>
                        <Td>
                            <Tooltip 
                                label='Edit device' 
                                fontSize='md'
                            >
                            <IconButton 
                                alignItems={"right"} 
                                size='xs' 
                                value = {ID}
                                onClick={(e) =>openEdit(ID)} 
                                icon={<EditIcon />} 
                                ml="5.5%" 
                                aria-label=""
                            />
                            </Tooltip>
                        </Td>
                        <Td>
                            <Tooltip 
                                label='Delete device' 
                                fontSize='md'
                            >
                            <IconButton 
                                alignItems={"right"}  
                                size='xs'
                                value = {ID}
                                onClick={(e)=> openDelete(ID)} 
                                icon={<DeleteIcon
                                    />} 
                                ml="5.5%"  
                                aria-label=""
                            />
                            </Tooltip>
                        </Td>
                        </Tr>
                        </Tbody>
                    </Table>
                </MenuItem>
            )})
    }
    
    return(
        <Menu 
            id="DeviceMenu"
            isOpen={showDeviceMenu.show}
        >
        <div>
            <MenuButton 
                as={Box} 
				size="sm"
                style= {showDeviceMenu.style}
            />
        </div>
        <MenuList
            onMouseLeave={() =>{addEventListener("click", closeMenu,{once:true})}}
            onMouseEnter={() =>{removeEventListener("click", closeMenu)}}
        >
            <MenuItem 
                alignContent={"center"}
                closeOnSelect={false}
            >                
                <Text
                    id="Menu-DeviceSelector"
                    onClick={()=>setShowDeviceSelector(
                                                        !showDeviceSelector.show, 
                                                        "Menu-DeviceSelector", 
                                                        MenuType.SubMenu
                                                        )
                            }
                    align={"center"}
                    w="100%"
                >
                    Select Device
                </Text>
                <Icon>
                    <ChevronRightIcon/>
                </Icon>
            </MenuItem>
            <MenuDivider />
            <MenuOptionGroup 
                type={'checkbox'} 
            >
            <MenuGroup 
                title='Viewable devices' 
            >
                {deviceMenu()}
            </MenuGroup>
            </MenuOptionGroup>
            <MenuDivider />
            <MenuGroup 
                title="Add a device"
            >
                <MenuItem>
                    <Text 
                        onClick={()=>setShowQRDialog(true)}
                        w="100%"
                        align={"center"}
                    >
                        Pair a device (QR code)
                    </Text>
                </MenuItem>
                <MenuItem>
                    <Text 
                        onClick={()=>setShowAddDevice(true)} 
                        id="add-device-button"
                        key="add-device-button"
                        w="100%"
                        align={"center"}
                    >
                        Add a device
                    </Text>
                </MenuItem>
            </MenuGroup>
        </MenuList>
        </Menu>
    )

}

export default DeviceMenu