import React from "react";
import AlarmOnce from "./AlarmOnce";
import AlarmWeekly from "./AlarmWeekly";
import AlarmDaily from "./AlarmDaily";
import AlarmYearly from "./AlarmYearly";
import AlarmCase from "./AlarmCase";
import { SafeAreaView, StatusBar } from "react-native";
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

    return(<>
    	<AlarmComponentsContext.Provider value={{ alarmCase, setAlarmCase, time, setTime, date, setDate, selectedDevices, setSelectedDevices, label, setLabel, weekdays, setWeekdays}}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
        <Modal isVisible={showModal}>
            <Button
                bg="gray400"
                h={35}
                w={35}
                position="absolute"
                top={50}
                right={15}
                rounded="circle"
                onPress={() => {setShowModal(false)}}
            >
                <Icon color="black900" name="close" />
            </Button>
            <Div m={100}>
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
            <Div row ml={80} mr={80}>
                <Button flex={1} m={20}>OK</Button>
                <Button flex={1} m={20} onPress={() => {setShowModal(false)}} > Cancel</Button>
            </Div>
        </Modal>
        </SafeAreaView>
        </AlarmComponentsContext.Provider>
    </>)
};

export default AlarmSelector;
