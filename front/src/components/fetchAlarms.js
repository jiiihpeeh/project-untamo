import axios from "axios";
import { notification } from "./notification";
const fetchAlarms = async ( token, server) => {
    let fetchedAlarms = [];
    try{
        let res = await axios.get(`${server}/api/alarms`,{
        headers: {'token': token}
        });
        localStorage['alarms'] = JSON.stringify(res.data);
        fetchedAlarms = res.data;
    }catch(err){
        console.log("Cannot fetch alarms");
        notification("Alarms", "Couldn't fetch the alarm list", "error")
        if (localStorage.getItem('alarms') !== null){
            fetchedAlarms = JSON.parse(localStorage['alarms']);
        }
    }
    return fetchedAlarms;
};

export default fetchAlarms;