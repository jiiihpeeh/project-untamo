import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
const fetchDevices = async ( token, server) => {
    let fetchedDevices = [];
    try{
        let res = await axios.get(`${server}/api/devices`,{
        headers: {'token': token}
        });
        //console.log("fetched devices: ", res.data)
        await AsyncStorage.setItem('devices', JSON.stringify(res.data))
        //console.log("devices", res.data);
        fetchedDevices = res.data;
    }catch(err){
        console.log("Cannot fetch devices");
        //otification("Devices", "Couldn't fetch the device list", "error")
        // if (await AsyncStorage.getItem('devices') !== null){
        //     fetchedDevices = JSON.parse(await AsyncStorage.getItem('devices') );
        // }
    }
    return fetchedDevices;
};

export default fetchDevices;
