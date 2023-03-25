import React, { useEffect} from "react"
import { useNavigate } from "react-router-dom"
import { Text, Grid, GridItem, Button, Menu, MenuButton, MenuList, Box, Divider,
         Tooltip, MenuItem , Spacer, HStack, VStack, Radio, RadioGroup, Center } from '@chakra-ui/react'
import { useLogIn, useDevices, extend } from "../stores"
import usePopups from "../stores/popUpStore"
import { ChevronDownIcon as Down } from  '@chakra-ui/icons';
import { SessionStatus, Path } from "../type"

import DeviceIcons from "./Device/DeviceIcons"
import { Device } from "../type"
import { useSettings } from '../stores'

const Welcome = () => {
    const userInfo = useLogIn((state)=> state.user)
    const clock24 = useSettings((state)=>state.clock24)
    const setClock24 = useSettings((state)=>state.setTimeFormat)

    const devices  = useDevices((state)=> state.devices)
    const setCurrentDevice  = useDevices((state)=> state.setCurrentDevice)
    const sessionStatus = useLogIn((state)=> state.sessionValid)
    const setShowAddDevice = usePopups(state => state.setShowAddDevice)
    const  navigate = useNavigate()

    const TimeFormatSelect = () => {
        return( 
            <Center>
                <Box m={"20px"}>
                    <Spacer/>
                    <Text as="b">Time Format</Text>
                    <VStack>
                            <RadioGroup>
                                <Radio
                                    isChecked={clock24}
                                    onChange={()=>setClock24(!clock24)}
                                >
                                    24 h
                                </Radio>
    {/*                             <Spacer/>
    */}                            <Radio
                                    isChecked={!clock24}
                                    onChange={()=>setClock24(!clock24)}
                                >
                                    12 h
                                </Radio>
                            </RadioGroup>
                    </VStack>
                </Box>
            </Center>
        )
    }

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
                        m={"20px"}

                    >
                        <GridItem>
                            <Menu
                                matchWidth={true}
                            >
                                <MenuButton 
                                    as={Button} 
                                    rightIcon={<Down/>}
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
            navigate(extend(Path.LogIn))
        }
    },[sessionStatus])
    
    return(
        <>{(userInfo.screenName.length > 0)? 
            <Text>Welcome, <Text as='b'>{userInfo.screenName}</Text>!</Text>: ''}
            <Divider/>
            <Spacer/>
            <TimeFormatSelect/>
            <Divider/>
            <Spacer/>
            <DeviceLayout/>
        </>
    )
}

export default Welcome