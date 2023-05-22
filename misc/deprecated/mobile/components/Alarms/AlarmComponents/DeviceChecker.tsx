import { Div, Checkbox, Text } from "react-native-magnus"
import React  from 'react'
import { ScrollView } from "react-native"
import useAlarm from "./alarmStates"
import  useDevices   from "../../../stores/deviceStore"

const DeviceChecker = () => {
    const devices  = useDevices((state)=>state.devices)
    const selectedDevices = useAlarm((state)=>state.devices)
    const setSelectedDevices = useAlarm((state)=>state.toggleDevices)
    
    const deviceLister = () => {
        return devices.map(device => 
                                        {
                                            return (
                                                        <Div 
                                                            key={`device-check-div-${device.id}`}
                                                        >
                                                            <Checkbox 
                                                                key={`device-check-${device.id}`}
                                                                checked={selectedDevices.includes(device.id)}   
                                                                onPress={() => setSelectedDevices(device.id)}
                                                                prefix={
                                                                        <Text 
                                                                            key={`device-check-text-${device.id}`}
                                                                        >
                                                                            {device.deviceName} {device.type}
                                                                        </Text>} 
                                                            />
                                                        </Div>
                                                    )
                                        }
                            )
    }


    return(
        <ScrollView>
            <Div 
                alignItems="center" 
                key={'device-list'}
            >
                {deviceLister()}
            </Div>
        </ScrollView>
    )
}
export default DeviceChecker


