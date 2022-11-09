import { useState, useEffect, useContext } from "react";
import axios from 'axios'
import { SessionContext } from "../context/SessionContext";
import { DeviceContext } from "../context/DeviceContext";
import { AlarmContext } from "../context/AlarmContext";

import { Button, Icon, Div,Text, View, Input, Image, Modal } from 'react-native-magnus';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import ServerAddress from "./ServerAddress";

const LogIn = ({navigation}) => {
  //const [visible, setVisible] = useState(false);
    const {token, setToken, setUserInfo, setSessionStatus, server } = useContext(SessionContext);

    const { setDevices } = useContext(DeviceContext);
    const {setAlarms} = useContext(AlarmContext);
    const [isLogInFormValid, setIsLogInFormValid] = useState(false);
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const logIn = async () => {
      console.log("Logging In....")
      try{
        let res = await axios.post(`${server}/login`,{user: user,password: password });
        console.log(res.data);
        let userInfoSave = Object.assign({}, res.data);
        delete userInfoSave.token;
        await AsyncStorage.setItem('token', JSON.stringify(res.data.token));
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoSave));
 
        setToken(res.data.token);
        setUserInfo(userInfoSave);
        setSessionStatus(true);
        let deviceData = await axios.get(`${server}/api/devices`,{
          headers: {'token': res.data.token}
          });
        let devices = deviceData.data;
        //console.log('fetched devices: ',devices)
        await AsyncStorage.setItem('devices', JSON.stringify(devices))
        setDevices(devices);
        let alarmData = await axios.get(`${server}/api/alarms`,
                    {headers: {'token': res.data.token}});
        console.log("ALARM!!!!: ", alarmData.data);
        let alarms = alarmData.data;
        
        await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
        
        setAlarms(alarms);
        //let info = JSON.parse(await AsyncStorage.getItem('userInfo'));
        //console.log(info);
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
        isOK();
    },[user, password])

    return (<Div flex={1} alignItems='center'>
              <ServerAddress/>
              <Image
                    h={100}
                    w={74}
                    source={require('./logo.png')}              
                    />
                <Div>
                    <Input
                            placeholder="Email"
                            p={10}
                            focusBorderColor="blue700"
                            ml="xs"
                            mr="xs"
                            mt="xl"
                            w={300}
                            value={user}
                            onChangeText={text => setUser(text)} 
                     />
                    <Input
                            placeholder="Password"
                            p={10}
                            focusBorderColor="blue700"
                            secureTextEntry
                            ml="xs"
                            mr="xs"
                            mt="xl"                            
                            w={300}
                            value={password}
                            onChangeText={text => setPassword(text)} 
                    />
                    <Button onPress={logIn} 
                            alignment="center" 
                            flexDirection='row'
                            height={50}
                            ml="xs"
                            mr="xs"
                            mt="xl"                            
                            w={300}
                            disabled={!isLogInFormValid}
                          >
                            LogIn
                    </Button>
                </Div>

          </Div>
    );
}

// const styles = StyleSheet.create({
//     textInput: {
//         margin: 16 
//     }
//   });

export default LogIn;

// <Box style={{ backgroundColor: "gray", margin: 10}} >
// <TextInput 
//     name="user" 
//     onChangeText={text => setUser(text)} 
//     label="Email" 
//     style={styles.textInput} 
//     type="email"/>
// <TextInput 
//     label="Password" 
//     onChangeText={text => setPassword(text)} 
//     style={styles.textInput} 
//     secureTextEntry={true} />
// <Button 
//     title="Log In" 
//     disabled={!isLogInFormValid} 
//     onPress={logIn}
//     style={{ alignSelf: "center", margin: 10 }}/>

// </Box>

// <Text style={{ alignSelf: "center", margin: 15 }}>
//     or
// </Text>
// <Button
//     title="Scan QR code"
//     leading={props => <Icon name="qrcode-scan" {...props} />}
// />
// <Button
//      title="Go to Welcome"
//      onPress={() => navigation.navigate('Welcome')}
//      style={{ alignSelf: "center", marginTop: 30 }}
// />