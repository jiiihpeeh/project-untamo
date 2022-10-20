import { useEffect, useContext, useState } from "react";
//import { useNavigate } from "react-router-dom";
//import DeviceSelector from "./DeviceSelector";
import { SessionContext } from "./contexts/SessionContext";
import { DeviceContext } from "./contexts/DeviceContext";

import AddDevice from "./AddDevice";
import DeviceSelector from "./DeviceSelector";
import { 
    Provider,
    Stack,
    Button,
    Dialog,
    DialogContent,
    Text,
    ListItem,
    VStack} from '@react-native-material/core';
import {AddDeviceAction} from "./AddDevice";


const Welcome = ({ navigation }) => {
    const { token, userInfo, sessionStatus} = useContext(SessionContext);
    const { currentDevice, devices } = useContext(DeviceContext);
    const [showAddDevice, setShowAddDevice] = useState(false);
    const DevicePicker = () => {
        if(devices.length > 0){
            return (
                <>  
                <VStack>
                    <DeviceSelector/>
                    <Text style={{textAlign: 'center'}}>or</Text>
                    <Button
                        title="Add Device"
                        onPress={() => navigation.navigate('Add device')}
                        style={{ alignSelf: "center", marginTop: 30 }}
                    />
                </VStack>
                </>
            )
        }
        return (
            <>  
            <VStack>
                <Button
                    title="Add Device"
                    onPress={() => navigation.navigate('Add device')}
                    style={{ alignSelf: "center", marginTop: 30 }}
                />
            </VStack>
            </>
        )

    }
    return(
        <>  
            <DevicePicker/>
        </>
    )
}

export default Welcome;