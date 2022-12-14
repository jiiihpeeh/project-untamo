import { useState, useEffect, useRef, useContext } from 'react';
import useWebSocket from 'react-native-use-websocket';
import { SessionContext } from '../context/SessionContext';
import { AlarmContext } from '../context/AlarmContext';
import { DeviceContext } from '../context/DeviceContext';
import sleep  from './sleep';
import { websocketAddress } from './websocketAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';



const UserWatcher = () => {
  //Public API that will echo messages sent to it back to the client
  const {token, setUserInfo, server, setSessionStatus } = useContext(SessionContext);
  const { setAlarms} = useContext(AlarmContext);
  const { setDevices } = useContext(DeviceContext);
  const wsURL = websocketAddress(server) +'/action'
  console.log(wsURL)
  const  socketUrl  = wsURL;
  const didUnmount = useRef(false);
  //const [messageHistory, setMessageHistory] = useState([]);
  const { sendMessage, lastJsonMessage } = useWebSocket(socketUrl, {
    onOpen: () => sendIdentity(),
    shouldReconnect: (closeEvent) => {
      /*
      useWebSocket will handle unmounting for you, but this is an example of a 
      case in which you would not want it to automatically reconnect
    */
      //return didUnmount.current === true;
      return true
    },
    reconnectAttempts: 1e8,
    reconnectInterval: 15000,
  });

 

  const sendIdentity = async () => {
    if(token && token.length >5){
      console.log('sending creds');
      sendMessage(JSON.stringify({mode:'client', token: token}));
      try {
        await sleep(500);
        let alarmData = await axios.get(`${server}/api/alarms`,
            {headers: {'token': token}});
        console.log("ALARM!!!!: ", alarmData.data);
        let alarms = alarmData.data;
        await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
        setAlarms(alarms);
        let deviceData = await axios.get(`${server}/api/devices`,{
          headers: {'token': token}
          });
        let devices = deviceData.data;
        //console.log('fetched devices: ',devices)
        await AsyncStorage.setItem('devices', JSON.stringify(devices))
        setDevices(devices);
        let userData = await axios.get(`${server}/api/user`,  {headers: {token: token}});
        await AsyncStorage.setItem('userInfo', JSON.stringify(userData.data));
        setUserInfo(userData.data);
        setSessionStatus(true);
      }catch(err){
        console.log(err);
      }
    }else{
      setTimeout(sendIdentity, 5000);
    }
  } 

  useEffect(() => {
    const watcher = async () => {  
      if (lastJsonMessage) {
        console.log("LAST Message: ", lastJsonMessage);
        let msgData = lastJsonMessage//JSON.parse(lastMessage.data);
        if(!msgData || !msgData.hasOwnProperty('url')){
          return "njoo";
        }
        console.log(msgData);
        let urlSplit = msgData.url.split('/');
        //console.log(urlSplit);
        if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'alarm'){
        try {
            await sleep(500);
            let alarmData = await axios.get(`${server}/api/alarms`,
                {headers: {'token': token}});
            console.log("ALARM!!!!: ", alarmData.data);
            let alarms = alarmData.data;
            await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
            setAlarms(alarms);
        }catch(err){
          console.log(err);
        }
      };
      if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'device'){
        try{
            await sleep(500);
            let deviceData = await axios.get(`${server}/api/devices`,{
              headers: {'token': token}
              });
            let devices = deviceData.data;
            //console.log('fetched devices: ',devices)
            await AsyncStorage.setItem('devices', JSON.stringify(devices))
            setDevices(devices);
        }catch(err){
          console.log(err);
        }
  
      };
      if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'editUser'){
        await sleep(5000);
        try {
          let userData = await axios.get(`${server}/api/user`,  {headers: {token: token}});
          await AsyncStorage.setItem('userInfo', JSON.stringify(userData.data));
          setUserInfo(userData.data);
        }catch(err){
          console.log(err);
        }
    
    };
  };
  };
  if(token){
    console.log('watcher called')
    watcher();
  }
    
  }, [lastJsonMessage]);

  useEffect(() => {
    sendIdentity();
  },[token])


  //const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: 'Connecting',
  //   [ReadyState.OPEN]: 'Open',
  //   [ReadyState.CLOSING]: 'Closing',
  //   [ReadyState.CLOSED]: 'Closed',
  //   [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  // }
  // //console.log(ReadyState)
  // [readyState];

  useEffect(() => {
    return () => {
      didUnmount.current = true;
    };
  }, []);
};

export default UserWatcher;
