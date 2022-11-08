import { useEffect, useContext, useState } from "react";

import { DeviceContext } from "../context/DeviceContext";
import { SessionContext } from "../context/SessionContext";

import DeviceSelector from "./DeviceSelector";
import { AlarmContext } from "../context/AlarmContext";
import { Button, Icon, Div,Text, View, Input, Image, Modal, Dropdown } from 'react-native-magnus';
import AddDevice from "./AddDevice";
import AlarmButton from "./AlarmButton";

const Alarms = () => {
    const { token, userInfo, sessionStatus} = useContext(SessionContext);
    const { currentDevice, devices, setDevices } = useContext(DeviceContext);
    const {alarms} = useContext(AlarmContext);
    const [ alarmViews, setAlarmViews ] = useState([]);

    useEffect(() => {
        const renderAlarms = () => {
            let alarmList =[];
            for(const item of alarms){
                alarmList.push(<AlarmButton alarm={item} key={`alarmbutton-${item._id}`}/>);
            }
        setAlarmViews(alarmList)
        }
        renderAlarms()
        console.log('Alarms', alarms)
    },[alarms])
    return(
        <>  
        <Div row>
            <Button flex={1} bg={"white"} >
                <Text as='b' fontSize={"xl"} color="black">This device</Text>
            </Button>
            <Button flex={1} bg={"white"} >
                <Text as='b' fontSize={"xl"} color="gray">All devices</Text>
            </Button>
        </Div>
            {alarmViews}
        </>
    )
}

export default Alarms;