import React, { useEffect, useRef } from "react"
import { Text, Grid, GridItem, Button, Menu, MenuButton, MenuList, Box, Divider,
          MenuItem , Spacer, VStack, Center, Heading, Table, Tr, Td, Tbody  } from '@chakra-ui/react'
import { useLogIn, useDevices } from "../stores"
import usePopups from "../stores/popUpStore"
import { ChevronDownIcon as Down } from  '@chakra-ui/icons';
import { SessionStatus, Path } from "../type"
import DeviceIcons from "./Device/DeviceIcons"
import TimeFormat from "./User/TimeFormat"

function Welcome() {
    const userInfo = useLogIn((state) => state.user)
    const devices = useDevices((state) => state.devices)
    const setCurrentDevice = useDevices((state) => state.setCurrentDevice)
    const currentDevice = useDevices((state) => state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const setShowAddDevice = usePopups(state => state.setShowAddDevice)
    const menuRef = useRef<HTMLButtonElement>(null)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    function TimeFormatSelect() {
        return (
            <Center>
                <Box m={"20px"}>
                    <Spacer />
                    <Text as="b">
                        Time Format
                    </Text>
                    <VStack>
                        <TimeFormat />
                    </VStack>
                </Box>
            </Center>
        )
    }

    function menuDevices() {
        return devices.map((device) => {
            return (
                <MenuItem
                    onClick={() => setCurrentDevice(device.id)}
                    key={`menu-device-${device.id}`}
                    closeOnSelect={true}
                    alignContent={"center"}
                >
                    <Table
                        variant={"unstyled"}
                        size="sm"
                    >
                        <Tbody>
                            <Tr>
                                <Td>
                                    <Text
                                        alignContent={"right"}
                                        textAlign="center"
                                    >
                                        {device.deviceName}
                                    </Text>
                                </Td>
                                <Td>
                                    <DeviceIcons device={device.type} />
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </MenuItem>
            )
        })
    }

    function DeviceLayout() {
        if (!devices || devices.length === 0) {
            return (<Grid
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
        } else {
            return (
                <Grid
                    key="Welcome-Grid-Devices"
                    m={"20px"}
                >
                    <GridItem>
                        <Menu matchWidth={true} isLazy={true}>
                            <MenuButton
                                as={Button}
                                rightIcon={<Down />}
                                ref={menuRef}
                                width="60%"
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
                            width={"60%"}
                        >
                            Add a device
                        </Button>
                    </GridItem>
                </Grid>
            )
        }
    }
    useEffect(() => {
        if (sessionStatus === SessionStatus.NotValid) {
            setNavigateTo(Path.LogIn)
        }
    }, [sessionStatus])
    useEffect(() =>{
        //setNavigateTo(Path.Alarms) if a current device is set
        if(currentDevice){
            setNavigateTo(Path.Alarms)
        }
    },[])

    return (
        <>{(userInfo.screenName.length > 0) ?
            <Heading
                textShadow={"xl"}
                m="2%"
            >
                Welcome, <Text as='b'>
                    {userInfo.screenName}
                </Text>!
            </Heading> : ''}
            <Divider />
            <Spacer />
            <TimeFormatSelect />
            <Divider />
            <Spacer />
            <DeviceLayout />
        </>
    )
}

export default Welcome