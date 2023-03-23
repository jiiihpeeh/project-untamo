import { Text, Checkbox, IconButton,Modal, Button,ModalOverlay,
        ModalContent,ModalHeader,ModalBody, Th, Thead,ModalCloseButton,
        VStack,  Radio, Tr, Td, Tbody, Center, Table, Tooltip } from '@chakra-ui/react'
import React from 'react'
import { useDevices, usePopups } from '../../stores'
import { EditIcon, DeleteIcon, ChevronRightIcon} from '@chakra-ui/icons'
import DeviceIcons from "./DeviceIcons"



const DeviceMenu = () => {
    const viewableDevices = useDevices((state)=> state.viewableDevices)
    const toggleViewableDevices = useDevices((state)=>state.toggleViewableDevices)
    const setShowDelete = usePopups((state) => state.setShowDeleteDevice)
    const setShowEdit = usePopups((state) => state.setShowEditDevice)
    const devices = useDevices((state) => state.devices)
    const setToDelete = useDevices((state)=>state.setToDelete)
    const setCurrentDevice = useDevices((state)=>state.setCurrentDevice)
    const currentDevice = useDevices((state)=>state.currentDevice)
    const setToEdit = useDevices((state)=>state.setToEdit)
    const setShowAddDevice = usePopups((state)=> state.setShowAddDevice)
    const setShowDeviceMenu = usePopups((state)=> state.setShowDeviceMenu)
    const showDeviceMenu = usePopups((state)=> state.showDeviceMenu)
    const setShowQRDialog = usePopups((state)=> state.setShowQRDialog)

    const openDelete = async(value:string) => {
        let delDevice = devices.filter(dev => dev.id === value)[0]
        if(delDevice){
            setToDelete(delDevice)
            setShowDelete(true)
        }
    }

    const openEdit = async(value:string) => {
        let editDevice = devices.filter(dev => dev.id === value)[0]
        if(editDevice){
            setToEdit(editDevice)
            setShowEdit(true)
        }
    }

    const deviceMenu = ()=> {
        return devices.map(deviceItem => {
            let ID = deviceItem.id
            return(
                    <Tr key={ID}>
                        <Td>
                            <Text size={"xs"}>
                                {deviceItem.deviceName} <DeviceIcons device={deviceItem.type}/>
                            </Text>
                        </Td>
                        <Td>
                            <Center>
                                <Checkbox
                                    isChecked={viewableDevices.includes(deviceItem.id)}
                                    onChange={()=>toggleViewableDevices(deviceItem.id)} 
                                >
                                </Checkbox>
                            </Center>
                        </Td>
                        <Td>
                            <Center>
                                <Radio 
                                    isChecked={currentDevice === ID} 
                                    onClick={()=>setCurrentDevice(ID)}
                                />
                            </Center>
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
                                icon={<DeleteIcon/>} 
                                aria-label=""
                            />
                            </Tooltip>
                        </Td>
                    </Tr>
            )})
    }

    return(
            <Modal 
                isOpen={showDeviceMenu} 
                onClose={() => setShowDeviceMenu(!showDeviceMenu)}
                isCentered
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Device Options
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Table 
                            size="sm"
                        >
                        <Thead>
                            <Tr>
                                <Th>Device</Th>
                                <Th>Show</Th>
                                <Th>Opt</Th>
                                <Th>Edit</Th>
                                <Th>Delete</Th>
                            </Tr>
                        </Thead>
                            <Tbody>
                                {deviceMenu()}
                            </Tbody>
                        </Table>
                        <VStack mt={"5px"}>
                            <Button
                                onClick={()=>setShowQRDialog(true)}
                            >
                                <Text 
                                    w="100%"
                                    align={"center"}
                                >
                                    Pair a device (QR code)
                                </Text>
                            </Button>
                            <Button
                                onClick={()=>setShowAddDevice(true)} 
                            >
                                <Text 
                                    id="add-device-button"
                                    key="add-device-button"
                                    w="100%"
                                    align={"center"}
                                >
                                    Add a device
                                </Text>
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
    )

}

export default DeviceMenu
