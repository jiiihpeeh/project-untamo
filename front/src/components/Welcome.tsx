import React, { useEffect} from "react"
import { useNavigate } from "react-router-dom"
import { Text, Grid, GridItem, Button, Menu, MenuButton, MenuList,
     Tooltip, MenuItem , Spacer, HStack, VStack } from '@chakra-ui/react'
import { useLogIn, useDevices, extend } from "../stores"
import usePopups from "../stores/popUpStore"
import { ChevronDownIcon } from  '@chakra-ui/icons';
import { SessionStatus } from "../type"

import DeviceIcons from "./Device/DeviceIcons"
import { Device } from "../type"


const Welcome = () => {
    const userInfo = useLogIn((state)=> state.user)
    const devices  = useDevices((state)=> state.devices)
    const setCurrentDevice  = useDevices((state)=> state.setCurrentDevice)
    const sessionStatus = useLogIn((state)=> state.sessionValid)
    const setShowAddDevice = usePopups(state => state.setShowAddDevice)
    const  navigate = useNavigate()
    
    const menuDevices =  () => {
        return devices.map((device) => {
                                        return(
                                                <MenuItem
                                                    onClick={() => setCurrentDevice(device.id)}   
                                                    key={`menu-device-${device.id}`}
                                                    closeOnSelect={true}
                                                >
                                                    <Tooltip label={device.type}>   
                                                        <HStack> 
                                                            <Text>
                                                                {device.deviceName}  
                                                            </Text>
                                                            <DeviceIcons device={device.type}/>
                                                        </HStack>
                                                    </Tooltip>   
                                                </MenuItem>
                                            )
                                        }
                            )
    }

    const DeviceLayout = () => {
        if(!devices || devices.length === 0){
            return(<Grid 
                        key="Welcome-Grid-no-Devices"
                    >
                    <GridItem>
                        <Button 
                            colorScheme='green' 
                            onClick={() => setShowAddDevice(true)} 
                            id="add-device-button"
                            key="add-device-button"
                        >
                            Add a device
                        </Button>
                    </GridItem>
                </Grid>
            )
        }else {
            return(
                    <Grid 
                        key="Welcome-Grid-Devices"
                    >
                        <GridItem>
                            <Menu
                                matchWidth={true}
                            >
                                <MenuButton 
                                    as={Button} 
                                    rightIcon={<ChevronDownIcon />}
                                >
                                    Select a Device
                                </MenuButton>
                                <MenuList>
                                    {menuDevices()}
                                </MenuList>
                            </Menu>
                        </GridItem>
                        <GridItem>
                            <Text>
                                or 
                            </Text>
                        </GridItem>
                        <GridItem>
                            <Button 
                                colorScheme='green' 
                                onClick={() => setShowAddDevice(true)} 
                                id="add-device-button"
                                key="add-device-button"
                            >
                                Add a device
                            </Button>
                        </GridItem>
                    </Grid>
            )
        }
    }
    useEffect(()=>{
        if(sessionStatus === SessionStatus.NotValid){
            navigate(extend("/login"))
        }
    },[sessionStatus])
    
    return(
        <>{(userInfo.screenName.length > 0)? 
            <Text>Welcome, <Text as='b'>{userInfo.screenName}</Text> !</Text>: ''}

            <DeviceLayout/>
        </>
    )
}

export default Welcome