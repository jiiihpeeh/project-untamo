
import React, { useState, useContext } from "react";
import { SafeAreaView, StatusBar, FlatList } from "react-native";
import { Div, Button, Icon, Modal, ThemeProvider, Text } from "react-native-magnus";
import axios from "axios";
import { AlarmContext } from "../context/AlarmContext";
import { SessionContext } from "../context/SessionContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DeleteAlarm = (props) => {

    const {  alarms, setAlarms } = useContext(AlarmContext);
    const { token, server } = useContext(SessionContext);
    const deleteAlarmID = async() => {
        console.log(`${server}/api/alarm/${props.editID}`)
        try {
            let res = await axios.delete(`${server}/api/alarm/${props.editID}`, {
                headers: {token: token}
            });
            let  alarmsAfterDelete = alarms.filter(alarm => alarm._id !== props.editID);
            setAlarms(alarmsAfterDelete);
            try{
                await AsyncStorage.setItem('alarms', JSON.stringify(alarmsAfterDelete));
            }catch(err){
                console.error("Clearing userinfo failed");
            };
        }catch(err){
            console.log("delete failed");
        };
        props.setDeleteAlarm(false);
        props.setShowModal(false);
    };

    
    return(
    <Div >
        <Modal isVisible={props.deleteAlarm}>
          {/* <Button
            bg="gray400"
            h={35}
            w={35}r
            position="absolute"
            top={50}
            right={15}
            rounded="circle"
            onPress={() => setVisible(false)}
          >
            <Icon color="black900" name="close" />
          </Button> */}
          <Div>
          <Text textAlign="center" fontSize="6xl" mt={100}>Are you sure?</Text>
            <Div row mt={150}>
                <Button flex={1} m={50} bg="red" onPress={() => deleteAlarmID()}>Yes</Button>
                <Button flex={1} m={50} onPress={() => {props.setDeleteAlarm(false);props.setShowModal(false)}} >Cancel</Button>
            </Div>
          </Div>
        </Modal>
    </Div>)
}






export default DeleteAlarm;

