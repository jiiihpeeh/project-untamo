import React from "react"
import { useNavigate } from "react-router-dom"
import { Text, Grid, GridItem, Button } from '@chakra-ui/react'
import { useLogIn, useDevices, usePopups } from "../stores"
import { MenuType } from "../stores/popUpStore"
import { ChevronDownIcon } from  '@chakra-ui/icons';

const Welcome = () => {
    const userInfo = useLogIn((state)=> state.user)
    const devices  = useDevices((state)=> state.devices)
    const setShowAddDevice = usePopups((state)=> state.setShowAddDevice)
    const setShowDeviceSelector = usePopups((state)=> state.setShowDeviceSelector)
    const showDeviceSelector = usePopups((state)=> state.showDeviceSelector.show)
    const  navigate = useNavigate()
    
    const DeviceLayout = () => {
        if(!devices || devices.length === 0){
            return(<Grid key="Welcome-Grid-no-Devices">
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
                    <Grid key="Welcome-Grid-Devices">
                        <GridItem>
                            <Button
                                id="Welcome-DeviceSelector"
                                onClick={()=>setShowDeviceSelector(
                                                                    !showDeviceSelector, 
                                                                    "Welcome-DeviceSelector", 
                                                                    MenuType.Menu
                                                                  )
                                        }
                            >
                                Select a device <ChevronDownIcon/>

                            </Button>
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

    return(
        <>{(userInfo.screenName.length > 0)? 
            <Text>Welcome, <Text as='b'>{userInfo.screenName}</Text> !</Text>: ''}

            <DeviceLayout/>
        </>
    )
}

export default Welcome