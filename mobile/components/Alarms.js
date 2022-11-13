import { useEffect, useContext, useState } from "react";

import { DeviceContext } from "../context/DeviceContext";
import { SessionContext } from "../context/SessionContext";

import DeviceSelector from "./DeviceSelector";
import { AlarmContext } from "../context/AlarmContext";
import { Button, Icon, Div,Text, Input, Image, Modal, Dropdown } from 'react-native-magnus';
import { ScrollView, TouchableHighlight, View } from 'react-native';
import AddDevice from "./AddDevice";
import AlarmButton from "./AlarmButton";
import { timeForNextAlarm } from "./calcAlarmTime";
import DateModal from "./AlarmComponents/DateModal";
import AddAlarm from "./AddAlarm";
import EditAlarm from "./EditAlarm";
import EditDrawer from './EditDrawer'
import PlayAlarm from "./PlayAlarm";
import AlarmWatcher from "./AlarmWatcher";

const Alarms = () => {
    const { token, userInfo, sessionStatus} = useContext(SessionContext);
    const { currentDevice, devices, setDevices } = useContext(DeviceContext);
    const { alarms, alarmWindow, setAlarmWindow } = useContext(AlarmContext);
    const [ alarmViews, setAlarmViews ] = useState([]);
    const [ allDevices, setAllDevices] = useState(false);
    const [ date, setDate ] = useState(new Date())
    const [ editID, setEditID ] = useState('');
    const [ playAlarm, setPlayAlarm ] = useState(false);

    useEffect(() => {
        const renderAlarms = () => {
            let showAlarms = alarms;            
            if(!allDevices){
                showAlarms = showAlarms.filter(alarm => alarm.device_ids.includes(currentDevice));
            }

            let viewableAlarmsSet = new Set ();		
            let timeAlarmMap = new Map();
            for(const secondFiltrate of showAlarms){
                viewableAlarmsSet.add(secondFiltrate);			
                let timeStamp = timeForNextAlarm(secondFiltrate).getTime();
                if(timeStamp && secondFiltrate){
                    if(timeAlarmMap.has(timeStamp)){
                        timeAlarmMap.set(timeStamp, timeAlarmMap.get(timeStamp).add(secondFiltrate._id) );
                    }else{
                        timeAlarmMap.set(timeStamp, new Set( [ secondFiltrate._id ]));
                    };
                };
            };
            let viewableAlarms = [...viewableAlarmsSet];
		
            let timeMapArray = [...timeAlarmMap.keys()].sort(function(a, b){return a - b});
            let sortedView = [];
            for(const item of timeMapArray){
                for (const subitem of timeAlarmMap.get(item)){
                    let filtration = viewableAlarms.filter(alarm => alarm._id === subitem)[0];
                    if(filtration){
                        sortedView.push(filtration);
                    };
                };
            };
            let alarmList =[];

            for(const item of sortedView){
                alarmList.push(<AlarmButton 
                                    alarm={item} 
                                    key={`alarmButton-${item._id}`}
                                    setEditID={setEditID}
                                    />);
            }
        setAlarmViews(alarmList);
        }
        renderAlarms();
        console.log('Alarms', alarms);
    },[alarms,allDevices]);

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
        <ScrollView>
            {alarmViews}
        </ScrollView>
        <AddAlarm/>
        <EditAlarm
            editID={editID}
            setEditID={setEditID}
        />
        <EditDrawer/>
        {/* <Button onPress={() => setAlarmWindow(true)}> Alarm</Button> */}
        <PlayAlarm/>
        <AlarmWatcher/>
        </>
    )
}

export default Alarms;