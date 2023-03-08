import { createRef } from "react"
import { Button, Dropdown, Text } from 'react-native-magnus'
import { DeviceType } from "../../type"
import useDeviceState from "./deviceStates"

const DeviceTypes = () => {
    const dropdownRef :any = createRef()
    const setDeviceType = useDeviceState((state)=>state.setType)
    const deviceType = useDeviceState((state)=>state.type)

    const deviceLists = () => {
        const deviceTypes = Object.values(DeviceType).filter((item) => item)

        return deviceTypes.map(deviceType => 
                                                {
                                                    return(
                                                        <Dropdown.Option 
                                                            key={DeviceType[deviceType]}
                                                            value="" 
                                                            py="md" 
                                                            px="xl" 
                                                            block  
                                                            onPress={() => setDeviceType(deviceType)}
                                                        >
                                                            {DeviceType[deviceType]}
                                                        </Dropdown.Option>
                                                    )
                                                }
        )
        
    }

    return(<>
        <Button
            block
            mt="sm"
            p="md"
            color="white"
            onPress={() => dropdownRef.current.open()}
            >
            <Text>
                Select Device type: {DeviceType[deviceType]}
            </Text>
        </Button>
        
        <Dropdown
            ref={dropdownRef}
            title={
                <Text 
                    mx="xl" 
                    color="gray500" 
                    pb="md"
                >
                    Select the type of your device
                </Text>
            }
            mt="md"
            pb="2xl"
            showSwipeIndicator={true}
            roundedTop="xl"
            
        >
            {deviceLists()}
        </Dropdown></>)
    }

export default DeviceTypes