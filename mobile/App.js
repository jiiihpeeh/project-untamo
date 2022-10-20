import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from "axios";
import LogIn from './LogIn';
import { SessionContext } from './contexts/SessionContext';
import { DeviceContext } from './contexts/DeviceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Welcome from './Welcome';
import { Button } from 'react-native';
import AddDevice from './AddDevice';
//import { createDrawerNavigator } from '@react-navigation/drawer';

const Stack = createNativeStackNavigator();

//const Drawer = createDrawerNavigator();
function App() {
  
  const [ offLineStorage, setOffLineStorage] = useState([]);
	const [ token, setToken ] = useState('');
	const [userInfo, setUserInfo] = useState({
		user: '',
		firstname: '',
		lastname: '',
		screenname: '',
	});
  const [ sessionStatus, setSessionStatus ] = useState(false);
  const [currentDevice, setCurrentDevice] = useState('');
  const [devices, setDevices] = useState([]);
  const [ viewableDevices, setViewableDevices ] = useState([]);
  useEffect(() =>  {
    const checkSession = async () => {
      if (token !== undefined){
        try {
          let res = await axios.get('http://192.168.2.207:3001/api/issessionvalid',  {
            headers: {'token': token}
          });
          if(res.data.status){
            console.log("session valid");
            setSessionStatus(true);
            //notification("Session", "Continuing session.", 'info');
          } else {
            console.log(res.status);
            setSessionStatus(false);
          }
        } catch(err){
          if(err.response.status === 403){
            setSessionStatus(false);
            console.log("session invalid");
            //notification("Session", "Session invalid.", 'error');
            
          }else{
            setSessionStatus(undefined);
            //notification("Session", "Can not contact server.", 'warning');
          }
        }
      } else {
        setSessionStatus(false);
      }
	  }
  checkSession();
  },[token])



  useEffect(()=>{
    const offLineStorageFetch = async () => {
      setOffLineStorage(await  AsyncStorage.getAllKeys());
    } 
    offLineStorageFetch();
  },[setToken, setUserInfo])
  useEffect(()=> {
    const savedValues = async () => {
      try{
        setToken(('token' in offLineStorage))? await  AsyncStorage.getItem('token'):'';
        setUserInfo(('userInfo' in offLineStorage))? JSON.parse(await  AsyncStorage.getItem('userInfo')):{};
        setCurrentDevice(('currentDevice' in offLineStorage))? JSON.parse(await  AsyncStorage.getItem('currentDevice')):'';
        setDevices(('devices' in offLineStorage))? JSON.parse(await  AsyncStorage.getItem('devices')):[];
        setViewableDevices(('viewableDevices' in offLineStorage))? JSON.parse(await  AsyncStorage.getItem('viewableDevices')):[];

      }catch(err){}
    }
    console.log(offLineStorage)
    savedValues();
  },[offLineStorage])
  return (
    <SessionContext.Provider value={{ token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus }}>
    <DeviceContext.Provider value={{ devices, setDevices, currentDevice, setCurrentDevice, viewableDevices, setViewableDevices }}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Log In" component={LogIn} /> 
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Add device" component={AddDevice} />
      </Stack.Navigator>
      {/* <Drawer.Navigator initialRouteName="Log In">
        <Drawer.Screen name="Log In" component={LogIn} /> 
        <Drawer.Screen name="Welcome" component={Welcome} />
      </Drawer.Navigator> */}
    </NavigationContainer>
    </DeviceContext.Provider>
    </SessionContext.Provider>
  );
}

export default App;