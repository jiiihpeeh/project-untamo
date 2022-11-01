import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { SessionContext } from '../contexts/SessionContext';
import { AlarmContext } from '../contexts/AlarmContext';
import fetchAlarms from './fetchAlarms';
const UserWatcher = () => {
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState('ws://localhost:3001/action');
  const didUnmount = useRef(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
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
  const {token} = useContext(SessionContext);
  const { setAlarms } = useContext(AlarmContext);

  const sendIdentity = () => {
    if(token){
      console.log('sending creds');
      sendMessage(JSON.stringify({mode:'client', token: token}));
    }else{
      setTimeout(sendIdentity, 5000);
    }
  } 
  useEffect(() => {
    const watcher = async () => { 
      if (lastMessage !== null) {
        console.log(lastMessage);
        let msgData = JSON.parse(lastMessage.data)//.split('/');
        if(msgData && msgData.hasOwnProperty('url') ){
          console.log(msgData)
          let urlSplit = msgData.url.split('/');
          console.log(urlSplit)
          if(urlSplit.length > 2 && urlSplit[1] === 'api' && urlSplit[2] === 'alarm'){
            let alarmData = await fetchAlarms(token)
            console.log(alarmData);
            setAlarms(alarmData);
          }
        
        }

        //setMessageHistory((prev) => prev.concat(lastMessage));
      }
    } 
  watcher()
  }, [lastMessage, setMessageHistory]);
 
  useEffect(() => {
    sendIdentity()
  },[token])


  //const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }
  //console.log(ReadyState)
  [readyState];

  useEffect(() => {
    return () => {
      didUnmount.current = true;
    };
  }, []);
};

export default UserWatcher;