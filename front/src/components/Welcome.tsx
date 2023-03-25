import React, { useEffect, useRef} from "react"
import { useNavigate } from "react-router-dom"
import { Text, Grid, GridItem, Button, Menu, MenuButton, MenuList, Box, Divider,
         Tooltip, MenuItem , Spacer, HStack, VStack, Center, Heading } from '@chakra-ui/react'
import { useLogIn, useDevices, extend } from "../stores"
import usePopups from "../stores/popUpStore"
import { ChevronDownIcon as Down } from  '@chakra-ui/icons';
import { SessionStatus, Path } from "../type"
import DeviceIcons from "./Device/DeviceIcons"
import TimeFormat from "./User/TimeFormat"


const Welcome = () => {
    const userInfo = useLogIn((state)=> state.user)
    const devices  = useDevices((state)=> state.devices)
    const setCurrentDevice  = useDevices((state)=> state.setCurrentDevice)
    const sessionStatus = useLogIn((state)=> state.sessionValid)
    const setShowAddDevice = usePopups(state => state.setShowAddDevice)
    const menuRef = useRef<HTMLButtonElement>(null)
    const  navigate = useNavigate()

    const TimeFormatSelect = () => {
        return( 
            <Center>
                <Box m={"20px"}>
                    <Spacer/>
                    <Text as="b">
                        Time Format
                    </Text>
                    <VStack>
                        <TimeFormat/>
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
                                                    alignContent={"center"}
                                                >
                                                    <HStack>
                                                        <Spacer/>
                                                        <Text
                                                            alignContent={"right"}
                                                            textAlign="center"
                                                        >
                                                            {device.deviceName}  
                                                        </Text>
                                                        <Spacer/>
                                                        <DeviceIcons device={device.type}/>
                                                        <Spacer/>
                                                    </HStack>
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
                            width={"50%"}
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
                            <Menu>
                                <MenuButton 
                                    as={Button} 
                                    rightIcon={<Down/>}
                                    ref={menuRef}
                                    width="50%"
                                >
                                    Select a Device
                                </MenuButton>
                                <MenuList
                                    width={(menuRef.current)?(menuRef.current.getBoundingClientRect().width):0}
                                >
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
                                width={"50%"}
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
            <Heading
                textShadow={"xl"}
                m="2%"
            >
                Welcome, <Text as='b'>
                            {userInfo.screenName}
                        </Text>!
            </Heading>: ''}
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