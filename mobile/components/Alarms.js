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
    const [allDevices, setAllDevices] = useState(false);

    useEffect(() => {
        const renderAlarms = () => {
            let showAlarms = alarms;
            if(!allDevices){
                showAlarms = showAlarms.filter(alarm => alarm.device_ids.includes(currentDevice))
            }
            let alarmList =[];

            for(const item of showAlarms){
                alarmList.push(<AlarmButton alarm={item} key={`alarmbutton-${item._id}`}/>);
            }
        setAlarmViews(alarmList)
        }
        renderAlarms()
        console.log('Alarms', alarms)
    },[alarms,allDevices])
    return(
        <>  
        <Div row alignItems="center">
                <Text as='b' 
                      fontSize={"xl"} 
                      color={allDevices?"gray": "black"} 
                      flex={1} 
                      m={10} 
                      textAlign="center"
                      onPress={() => setAllDevices(false)}
                >
                      This device
                </Text>
                <Text as='b' 
                      fontSize={"xl"} 
                      color={allDevices?"black": "gray"}
                      flex={1} m={10} 
                      textAlign="center"
                      onPress={() => setAllDevices(true)}
                >
                      All devices
                </Text>
        </Div>
            {alarmViews}
        </>
    )
}

export default Alarms;