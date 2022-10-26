import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { SessionContext } from '../contexts/SessionContext';
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

  const sendIdentity = () => {
    console.log('sending creds')
    sendMessage(JSON.stringify({mode:'client', token: token}));
  } 
  useEffect(() => {
    if (lastMessage !== null) {
        console.log(lastMessage)
        console.log(JSON.parse(lastMessage.data))
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);



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