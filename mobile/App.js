import { StatusBar, SafeAreaView  } from 'react-native';
import { ThemeProvider, Button, Icon, Div,Text, View } from 'react-native-magnus';
import  React, { useState, useEffect } from 'react';
//import { NavigationContainer } from '@react-navigation/native';
import LogIn from './components/LogIn';
import AlarmView from './components/AlarmView';
import { SessionContext } from './context/SessionContext';
import { DeviceContext } from './context/DeviceContext';
import { AlarmContext } from './context/AlarmContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import UserWatcher from './components/UserWatcher';

import axios from 'axios'


const  App =  () => {
  const [ token, setToken ] = useState( null);
	const [ server, setServer] = useState('https://kukkoilija.chickenkiller.com/server')
	const [ userInfo, setUserInfo ] = useState({});
	const [ currentDevice, setCurrentDevice ] = useState( null);
	const [ devices, setDevices ] = useState([]) ;
	const [ sessionStatus, setSessionStatus ] = useState(false);
	const [ signInTime, setSignedInTime ] = useState(0);
	const [ viewableDevices, setViewableDevices ] = useState( []);
	const [ fetchQR, setFetchQR ] = useState(false);
	const [ alarms, setAlarms ] = useState([]) ;
	const [ runAlarm, setRunAlarm ] = useState('');
	const [ runOtherSnooze, setRunOtherSnooze ] = useState(false);
  const [ alarmWindow, setAlarmWindow ] = useState(false);


  useEffect(() => {
    const storedData = async () => {
      //await AsyncStorage.clear()
      let keys = await AsyncStorage.getAllKeys();
      console.log(keys)
      setToken(keys.includes('token') ? JSON.parse(await AsyncStorage.getItem('token')) : null);
      setServer(keys.includes('server') ? JSON.parse(await AsyncStorage.getItem('server')) : 'https://kukkoilija.chickenkiller.com/server')
      setUserInfo(keys.includes('userInfo') ? JSON.parse(await AsyncStorage.getItem('userInfo')) : {});
      setCurrentDevice(keys.includes('currentDevice') ? JSON.parse(await AsyncStorage.getItem('currentDevice')) : null);
      setDevices(keys.includes('devices') ? JSON.parse(await AsyncStorage.getItem('devices')) : []) ;
      setSessionStatus(undefined);
      setSignedInTime((keys.includes('signInTime'))? JSON.parse(await AsyncStorage.getItem('signInTime')) :0);
      setViewableDevices((keys.includes('viewableDevices')) ? JSON.parse(await AsyncStorage.getItem('viewableDevices')) : []);
      setFetchQR(false);
      setAlarms(keys.includes('alarms') ? JSON.parse(await AsyncStorage.getItem('alarms')) : []) ;
      setRunAlarm('');
      setRunOtherSnooze(false);
    }
    storedData();
  },[])
  useEffect(() =>{
    const checkSession = async () => {
      if (token && server){
        console.log(token)
        try {
          console.log(`${server}/api/issessionvalid`,token )
          let res = await axios.get(`${server}/api/issessionvalid`,  {
            headers: {token: token}
          });

        } catch(err){
          if(err.response.status === 403){
            setSessionStatus(false);
            console.log(err)
            console.log("session invalid");
            
          }else{
            setSessionStatus(false);
          }
        }
      } else {
        setSessionStatus(false);
      }
    };
    checkSession();
  },[token, server])


  return (
    <ThemeProvider >
      <SessionContext.Provider value={{ token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus, fetchQR, setFetchQR, signInTime, setSignedInTime, server, setServer  }}>
      <DeviceContext.Provider value={{ currentDevice, setCurrentDevice, devices, setDevices, viewableDevices, setViewableDevices }}>
		  <AlarmContext.Provider value={{ alarms, setAlarms, runAlarm, setRunAlarm, runOtherSnooze, setRunOtherSnooze, alarmWindow, setAlarmWindow }}>

      <StatusBar/>
        <SafeAreaView style={{ flex: 1 }}>
        {!sessionStatus &&
          <LogIn/>}
        {sessionStatus  &&
          <AlarmView/>}
        <UserWatcher/>
        </SafeAreaView>
      <StatusBar/>
      </AlarmContext.Provider>
      </DeviceContext.Provider>
      </SessionContext.Provider>
    </ThemeProvider>
  );
}


export default App;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
