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



const  App =  () => {
  const [ token, setToken ] = useState( undefined);
	const [ server, setServer] = useState('http://192.168.2.207:3001')
	const [ userInfo, setUserInfo ] = useState({});
	const [ currentDevice, setCurrentDevice ] = useState( null);
	const [ devices, setDevices ] = useState([]) ;
	const [ sessionStatus, setSessionStatus ] = useState(undefined);
	const [ signInTime, setSignedInTime ] = useState(0);
	const [ viewableDevices, setViewableDevices ] = useState( []);
	const [ fetchQR, setFetchQR ] = useState(false);
	const [ alarms, setAlarms ] = useState([]) ;
	const [ runAlarm, setRunAlarm ] = useState('');
	const [ runOtherSnooze, setRunOtherSnooze ] = useState(false);


  useEffect(() => {
    const storedData = async () => {
      //await AsyncStorage.clear()
      let keys = await AsyncStorage.getAllKeys();
      console.log(keys)
      setToken(keys.includes('token') ? await AsyncStorage.getItem('token') : undefined);
      setServer(keys.includes('server') ? JSON.parse(await AsyncStorage.getItem('server')) : 'http://192.168.2.207:3001')
      setUserInfo(keys.includes('userInfo') ? JSON.parse(await AsyncStorage.getItem('userInfo')) : {});
      setCurrentDevice(keys.includes('currentDevice') ? await AsyncStorage.getItem('currentDevice') : null);
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

  },[token])


  return (
    <ThemeProvider >
      <SessionContext.Provider value={{ token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus, fetchQR, setFetchQR, signInTime, setSignedInTime, server, setServer  }}>
      <DeviceContext.Provider value={{ currentDevice, setCurrentDevice, devices, setDevices, viewableDevices, setViewableDevices }}>
		  <AlarmContext.Provider value={{ alarms, setAlarms, runAlarm, setRunAlarm, runOtherSnooze, setRunOtherSnooze }}>

      <StatusBar/>
        <SafeAreaView style={{ flex: 1 }}>
        {!sessionStatus &&
          <LogIn/>}
        {sessionStatus  &&
          <AlarmView/>}
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
