import { useState, useEffect, useContext } from "react";
import axios from 'axios'
import { TextInput, Button, Box, Text } from "@react-native-material/core";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionContext } from "./contexts/SessionContext";
import { DeviceContext } from "./contexts/DeviceContext";
import AddDevice from "./AddDevice";
import fetchDevices from "./fetchDevices";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet } from 'react-native';


const LogIn = ({navigation}) => {
    const {token, setToken, setUserInfo, setSessionStatus } = useContext(SessionContext);
    const { setDevices } = useContext(DeviceContext);
    const [isLogInFormValid, setIsLogInFormValid] = useState(false);
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const logIn = async () => {
      console.log("Logging In....")
      try{
        let res = await axios.post('http://192.168.2.207:3001/login',{user: user,password: password });
        console.log(res.data);
        let userInfoSave = Object.assign({}, res.data);
        delete userInfoSave.token;
        await AsyncStorage.setItem('token', JSON.stringify(res.data.token));
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoSave));
 
        setToken(res.data.token);
        setUserInfo(userInfoSave);
        setSessionStatus(true);
        let devices = fetchDevices(res.data.token);
        setDevices(devices)
        let info = JSON.parse(await AsyncStorage.getItem('userInfo'));
        console.log(info);
      }catch(err){
        console.log(err)
      }
    }
    useEffect(() => {
        const isOK = () => {
          if(password.length > 5 && emailPattern.test(user)){
            setIsLogInFormValid(true);
          }else {
            setIsLogInFormValid(false);
          }
        };

    const emailPattern = new RegExp(".+@.+..+");
      //console.log(user, password)
        isOK();
    },[user, password])

    return (<>
        <Box style={{ backgroundColor: "gray", margin: 10}} >
        <TextInput 
            name="user" 
            onChangeText={text => setUser(text)} 
            label="Email" 
            style={styles.textInput} 
            type="email"/>
        <TextInput 
            label="Password" 
            onChangeText={text => setPassword(text)} 
            style={styles.textInput} 
            secureTextEntry={true} />
        <Button 
            title="Log In" 
            disabled={!isLogInFormValid} 
            onPress={logIn}
            style={{ alignSelf: "center", margin: 10 }}/>

        </Box>
 
        <Text style={{ alignSelf: "center", margin: 15 }}>
            or
        </Text>
        <Button
            title="Scan QR code"
            leading={props => <Icon name="qrcode-scan" {...props} />}
        />
        <Button
             title="Go to Welcome"
             onPress={() => navigation.navigate('Welcome')}
             style={{ alignSelf: "center", marginTop: 30 }}
        />
        </>
    );
}

const styles = StyleSheet.create({
    textInput: {
        margin: 16 
    }
  });

export default LogIn;