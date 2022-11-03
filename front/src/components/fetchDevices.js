import axios from "axios";
import { notification } from "./notification";
const fetchDevices = async ( token, server) => {
    let fetchedDevices = [];
    try{
        let res = await axios.get(`${server}/api/devices`,{
        headers: {'token': token}
        });
        localStorage['devices'] = JSON.stringify(res.data);
        fetchedDevices = res.data;
    }catch(err){
        console.log("Cannot fetch devices");
        notification("Devices", "Couldn't fetch the device list", "error")
        if (localStorage.getItem('devices') !== null){
            fetchedDevices = JSON.parse(localStorage['devices']);
        }
    }
    return fetchedDevices;
};

export default fetchDevices;