
import React, { useState, useContext } from "react";
import { SafeAreaView, StatusBar, FlatList } from "react-native";
import { Div, Button, Icon, Modal, ThemeProvider, Text } from "react-native-magnus";
import axios from "axios";
import { DeviceContext } from "../context/DeviceContext";
import { SessionContext } from "../context/SessionContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LogOut = () => {
    const [visible, setVisible] = useState(false);

    const {  setCurrentDevice, setDevices } = useContext(DeviceContext);
    const { token, setToken,  setUserInfo,  setSessionStatus, server } = useContext(SessionContext);
    const logOut = async() =>{
        try {
            let res = await axios.post(`${server}/logout`, {msg: "smell you later"}, {
                headers: {'token': token}
            });
            setToken(undefined);
            setSessionStatus(false);
            setUserInfo({});
            setCurrentDevice(undefined);
            setDevices([]);

            try{
                await AsyncStorage.clear();
 
            }catch(err){
                console.error("Clearing userinfo failed");
    
            };
        }catch(err){
            console.log("Log out failed");
        };
        setVisible(false)
    };

    
    return(
    <Div >
        <Button block m={10} onPress={() => setVisible(true)}>
          LogOut
        </Button>

        <Modal isVisible={visible}>
          <Button
            bg="gray400"
            h={35}
            w={35}
            position="absolute"
            top={50}
            right={15}
            rounded="circle"
            onPress={() => {
              setVisible(false);
            }}
          >
            <Icon color="black900" name="close" />
          </Button>
          <Div>
          <Text textAlign="center" fontSize="6xl" mt={100}>Are you sure?</Text>
            <Div row mt={150}>
                <Button flex={1} m={50} bg="red" onPress={() => logOut()}>Yes</Button>
                <Button flex={1} m={50} onPress={() => setVisible(false)} >Cancel</Button>
            </Div>
          </Div>
        </Modal>
    </Div>)
}






export default LogOut;

