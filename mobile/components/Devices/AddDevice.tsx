import { useState } from "react"
import { Button, Icon, Div,Text,  Input, Image, Modal, Dropdown } from 'react-native-magnus'
import DeviceTypes from "./DeviceTypes"
import useDevices  from "../../stores/deviceStore"
import useDeviceState from "./deviceStates"

const AddDevice = () => {
    const deviceName = useDeviceState((state)=>state.deviceName)
    const setDeviceName = useDeviceState((state)=>state.setDeviceName)
    const reset = useDeviceState((state)=>state.reset)
    const deviceType = useDeviceState((state)=>state.type)
    const canAdd = useDeviceState((state)=>state.canAdd)
    const [ visible, setVisible ] = useState(false)
    const addDevice  = useDevices((state)=> state.addDevice)

    return(
        <>
            <Button 
                block m={10} 
                onPress={() => {
                                    setVisible(true)
                                    reset()
                                }
                        } 
                bg={"teal"}
            >
                Add a Device
            </Button>

            <Modal 
                isVisible={visible}
            >
                <Div>
                    <Button
                        bg="gray400"
                        h={35}
                        w={35}
                        position="absolute"
                        top={40}
                        right={15}
                        rounded="circle"
                        onPress={() =>  {
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
                            mt={90}
                            mb={10}
                            placeholder="Device name"
                            value={deviceName}
                            onChangeText={text => setDeviceName(text)} 
                    />
                    <DeviceTypes/>            
                    <Button 
                        onPress={()=>{
                                        addDevice(deviceName, deviceType)
                                        setVisible(false)
                                        reset()
                                    }
                                }
                        m={10}
                        disabled={!canAdd}
                    >
                        OK
                    </Button>
                </Div>
            </Modal>
        </>
    )

}

export default AddDevice