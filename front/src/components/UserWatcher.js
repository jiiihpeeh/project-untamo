import { useState, useEffect, useRef, useContext } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { SessionContext } from '../contexts/SessionContext';
import { AlarmContext } from '../contexts/AlarmContext';
import { DeviceContext } from '../contexts/DeviceContext';
import fetchAlarms from './fetchAlarms';
import fetchDevices from './fetchDevices';
import { userInfoFetch } from './userInfoFetch';
import sleep  from './sleep';
import { websocketAddress } from './websocketAddress';


const UserWatcher = () => {
  //Public API that will echo messages sent to it back to the client
  const {token, setUserInfo, server } = useContext(SessionContext);
  const { setAlarms} = useContext(AlarmContext);
  const { setDevices } = useContext(DeviceContext);
  const wsURL = websocketAddress(server) +'/action'
  console.log(wsURL)
  const [ socketUrl ] = useState(wsURL);
  const didUnmount = useRef(false);
  //const [messageHistory, setMessageHistory] = useState([]);
  const { sendMessage, lastMessage } = useWebSocket(socketUrl, {
    onOpen: () => sendIdentity(),
    shouldReconnect: (closeEvent) => {
      /*
      useWebSocket will handle unmounting for you, but this is an example of a 
      case in which you would not want it to automatically reconnect
    */
      return didUnmount.current === false;
    },
    reconnectAttempts: 1e8,
    reconnectInterval: 60000,
  });

 

  const sendIdentity = async () => {
    if(token){
      console.log('sending creds');
      sendMessage(JSON.stringify({mode:'client', token: token}));
      try{
        let alarmData = await fetchAlarms(token, server);
        setAlarms(alarmData);
        let deviceData = await fetchDevices(token, server);
        setDevices(deviceData);
        let userData = await userInfoFetch(token, server);
        setUserInfo(userData);
      }catch(err){
        console.log(err);
      }
    }else{
      setTimeout(sendIdentity, 5000);
    }
  } 

  useEffect(() => {
    const watcher = async () => { 
      if (lastMessage !== null) {
        //console.log(lastMessage);
        let msgData = JSON.parse(lastMessage.data);
        if(!msgData || !msgData.hasOwnProperty('url')){
          return;
        }
          
        console.log(msgData);
        let urlSplit = msgData.url.split('/');
        //console.log(urlSplit);
      if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'alarm'){
        await sleep(500);
        let alarmData = await fetchAlarms(token, server);
        // console.log(alarmData);
        setAlarms(alarmData);
      };
      if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'device'){
        await sleep(500);
        let deviceData = await fetchDevices(token, server);
        setDevices(deviceData);
      };
      if(urlSplit.length > 2 && urlSplit[urlSplit.length - 3] === 'api' && urlSplit[urlSplit.length - 2] === 'editUser'){
        await sleep(5000);
        let userData = await userInfoFetch(token, server);
        setUserInfo(userData);
      };
    };
  };
  watcher();
  }, [lastMessage, setDevices, setAlarms, setUserInfo, token ]);

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
