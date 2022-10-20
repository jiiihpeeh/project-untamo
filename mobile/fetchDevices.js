import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
const fetchDevices = async ( token) => {
    let fetchedDevices = [];
    try{
        let res = await axios.get(`http://192.168.2.207:3001/api/devices`,{
        headers: {'token': token}
        });
        await AsyncStorage.setItem('devices', JSON.stringify(res.data))
        fetchedDevices = res.data;
    }catch(err){
        console.log("Cannot fetch devices");
        notification("Devices", "Couldn't fetch the device list", "error")
        if (await AsyncStorage.getItem('devices') !== null){
            fetchedDevices = JSON.parse(await AsyncStorage.getItem('devices') );
        }
    }
    return fetchedDevices;
};

export default fetchDevices;