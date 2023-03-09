import { useState, useEffect, createRef, } from "react"
import { Select, Button, Text , Dropdown} from "react-native-magnus"
import useDevices from "../../stores/deviceStore"

const DeviceSelector = () => {
    const  devices = useDevices((state)=>state.devices)
    const setCurrentDevice = useDevices((state)=>state.setCurrentDevice)
    const currentDevice = useDevices((state)=>state.currentDevice)
    const filteredCurrentDeviceName = devices.filter(device=> device.id === currentDevice)[0]
    const currentDeviceName = (filteredCurrentDeviceName)?filteredCurrentDeviceName.deviceName:''
    const selectButtonText = `Select a device ${(currentDeviceName.length >0)?`(current: ${currentDeviceName})`:''}`
    const dropdownRef : any= createRef()

    const deviceMap = () => {
        return devices.map(device => 
                                      {
                                        return (<Dropdown.Option 
                                                    onPress={() => {setCurrentDevice(device.id)}}
                                                    key={`select-${device.id}`}
                                                    value={device.id}
                                                >
                                                <Text> {device.deviceName} {device.type}</Text>
                                              </Dropdown.Option>
                                        )
                                      }
      )
    }

    return (
        <>
        <Button
          block
          bg="teal"
          p="md"
          color="white"
          m={20}
          mt={10}
          mb={10}
          mr={20}
          onPress={() => dropdownRef.current.open()}
        >
          {selectButtonText}
        </Button>

        <Dropdown
          ref={dropdownRef}
          title={
                  <Text 
                    mx="xl" 
                    color="gray500" 
                    pb="md"
                  >
                    Select a device 
                  </Text>
                }
          mt="md"
          pb="2xl"
          showSwipeIndicator={true}
          roundedTop="xl"
        >
          {deviceMap()}
        </Dropdown>
      </>
    )
}
export default DeviceSelector