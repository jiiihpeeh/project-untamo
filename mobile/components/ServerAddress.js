import { useState, useEffect, useContext } from "react";
import { Button, Icon, Div,Text, View, Input, Image, Modal } from 'react-native-magnus';
import { SessionContext } from '../context/SessionContext';
import AsyncStorage  from '@react-native-async-storage/async-storage';



const ServerAddress = () => {
    const [visible, setVisible] = useState(false);
    const {server, setServer} = useContext(SessionContext);
    useEffect(()=>{
        const saveAddress = async() =>{
            await AsyncStorage.setItem('server', JSON.stringify(server));
        }
        saveAddress();
    },[server]);
    return(<>
        <Button block m={10} 
                onPress={() => setVisible(true)}
                bg="green"
                >
            Server Address
        </Button>
            <Modal isVisible={visible}>
            <Input
                placeholder="Server Address"
                focusBorderColor="blue700"
                onChangeText={text => setServer(text)} 
                value={server}
                block m={10}
                mt={80}
                />
            <Button
                block m={10}
                onPress={() => {
                setVisible(false);
                }}
            >
                OK
            </Button>
            </Modal>
    </>)
}

export default ServerAddress;