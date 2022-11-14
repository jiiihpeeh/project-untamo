import React from "react";
import AlarmOnce from "./AlarmOnce";
import AlarmWeekly from "./AlarmWeekly";
import AlarmDaily from "./AlarmDaily";
import AlarmYearly from "./AlarmYearly";
import AlarmCase from "./AlarmCase";
import { SafeAreaView, StatusBar , ScrollView} from "react-native";
import { AlarmComponentsContext } from "./AlarmComponentsContext";
import { Div, Button, Icon, Modal, ThemeProvider } from "react-native-magnus";


const AlarmSelector = (props) => {
    const alarmCase = props.alarmCase;
    const setAlarmCase = props.setAlarmCase;
    const setTime= props.setTime;
    const time= props.time;
    const setDate= props.setDate;
    const date= props.date;
    const selectedDevices= props.selectedDevices;
    const setSelectedDevices= props.setSelectedDevices;
    const label = props.label;
    const setLabel= props.setLabel;
    const weekdays =  props.weekdays;
    const setWeekdays = props.setWeekdays;
    const showModal = props.showModal;
    const setShowModal = props.setShowModal;
    const postAlarm= props.postAlarm;
    const setPostAlarm= props.setPostAlarm;
    const active = props.active;
    const setActive = props.setActive;
    const setCancel = props.setCancel;
    const showDelete = props.showDelete;
    const setDeleteAlarm = props.setDeleteAlarm;

    return(<>
    	<AlarmComponentsContext.Provider value={{ alarmCase, setAlarmCase, time, setTime, date, setDate, selectedDevices, setSelectedDevices, label, setLabel, weekdays, setWeekdays, active, setActive}}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
        <Modal isVisible={showModal}>
        <ScrollView>
{/*             <Button
                bg="gray400"
                h={35}
                w={35}
                position="absolute"
                top={20}
                right={15}
                rounded="circle"
                onPress={() => {setCancel(true)}}
            >
                <Icon color="black900" name="close" />
            </Button> */}
            <Div >
            <AlarmCase/>
            {alarmCase === 'once' &&
            <AlarmOnce />}
            {alarmCase === 'weekly' &&
            <AlarmWeekly  />}
            {alarmCase === 'daily' &&
            <AlarmDaily />}
            {alarmCase === 'yearly' &&
            <AlarmYearly  />}
            </Div>
            <Div alignItems="center">
                <Div row >
                    <Button flex={1} m={20} onPress={() => {setPostAlarm(true)}} >OK</Button>
                    <Button flex={1} m={20} onPress={() => {setCancel(true)}} > Cancel</Button>
                </Div>
                {showDelete &&
                    <Div alignItems="center">
                        <Button m={20} bg="red" onPress={() => {setDeleteAlarm(true)}} > Delete</Button>
                    </Div>}
            </Div>
            </ScrollView>
        </Modal>
        </SafeAreaView>
        </AlarmComponentsContext.Provider>
    </>)
};

export default AlarmSelector;
