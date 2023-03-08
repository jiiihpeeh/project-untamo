import React, { useEffect,  useState, createRef } from "react"
import { Button, Icon, Div,Text,  Input, Image, Modal, Dropdown } from 'react-native-magnus'
import DeviceTypes from "./DeviceTypes"
import { ScrollView, TouchableHighlight } from 'react-native'
import { useDevices } from "../../stores"
import useDeviceState from "./deviceStates"

const EditDevice = () => {
    const deviceName = useDeviceState((state)=>state.deviceName)
    const setDeviceName = useDeviceState((state)=>state.setDeviceName)
    const deviceId = useDeviceState((state)=>state.id)
    const reset = useDeviceState((state)=>state.reset)
    const deviceType = useDeviceState((state)=>state.type)
    const setDevice = useDeviceState((state)=> state.setDevice)
    const [ visible, setVisible ] = useState(false)
    const addDevice  = useDevices((state)=> state.addDevice)
    const  devices = useDevices((state)=>state.devices)
    const editDevice = useDevices((state)=>state.editDevice)
    const canEdit = useDeviceState((state)=>state.canEdit)
    const dropdownRef : any= createRef()

    const deviceMap = () => {
        return devices.map(device => 
                                      {
                                        return (<Dropdown.Option 
                                                    onPress={() => {setDevice(device.id, device.deviceName, device.type)}}
                                                    key={`select-${device.id}`}
                                                    value={device.id}
                                                >
                                                <Text> {device.deviceName} {device.type}</Text>
                                              </Dropdown.Option>
                                        )
                                      }
        )
    }

    return(
        <>
            <Button 
                block m={10} 
                onPress={() => setVisible(true)} 
                bg={"teal"}
            >
                Edit a Device
            </Button>
            
            <Modal 
                isVisible={visible}
            >
                <Div 
                    flex={1} 
                    alignItems='center'
                >                    
                    <Button
                        block
                        bg="teal"
                        p="md"
                        color="white"
                        m={50}
                        mt={80}
                        mb={10}
                        mr={20}
                        onPress={() => dropdownRef.current.open()}
                    >
                        Select a device
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
                    <Button
                        bg="gray400"
                        h={35}
                        w={35}
                        position="absolute"
                        top={40}
                        right={15}
                        rounded="circle"
                        onPress={() => {
                                            setVisible(false)
                                    }
                        }
                    >
                        <Icon 
                            color="black900" 
                            name="close" 
                        />
                    </Button>
                    <Input 
                        m={10}
                        mt={30}
                        mb={10}
                        placeholder="Device name"
                        value={deviceName}
                        onChangeText={text => setDeviceName(text)} 
                    />
                    <DeviceTypes/>            
                    <Button 
                        onPress={()=>{
                                        editDevice(deviceId,deviceName,deviceType)
                                        setVisible(false)
                                        reset()
                                    }}
                        mt={10}
                        m={20}
                        disabled={!canEdit}   
                    >
                        OK
                    </Button>
                </Div>
            </Modal>
        </>
    )
}

export default EditDevice