import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
const fetchAlarms = async ( token, server) => {
    let fetchedAlarms = [];
    try{
        let res = await axios.get(`${server}/api/alarms`,{
            headers: {'token': token}
        });
        await AsyncStorage.setItem('alarms', JSON.stringify(res.data))
        fetchedAlarms = res.data;
    }catch(err){
        console.log("Cannot fetch alarms");
        fetchedAlarms = JSON.parse(await AsyncStorage.getItem('alarms'));
    }
    return fetchedAlarms;
};

export default fetchAlarms;