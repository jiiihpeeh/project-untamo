import React, { useState, useEffect } from "react";
import { timePadding } from './stringifyDate-Time'
import { Text, Div } from 'react-native-magnus';
import DateModal from "./DateModal";
import useAlarm from "./alarmStates";

const TimeSelector = () => {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)

    const dateSetter = () => {
        let timeArr = time.split(':')
        let dateTime = new Date()
        dateTime.setHours(parseInt( timeArr[0]))
        dateTime.setMinutes(parseInt(timeArr[1]))
        return dateTime;
    }
    
    const [ date, setDate ] = useState(dateSetter());

    
    useEffect(() => {
        if(!date){
            setDate(new Date());
        }if(date){
            setTime(`${timePadding(date.getHours())}:${timePadding(date.getMinutes())}`);
        }
        
    },[date])

    return(
            <Div alignItems="center">
            <Div  row>
                <Text>Time: </Text>
                <DateModal
                    mode={'time'}
                    date = {date}
                    setDate ={setDate}
                />
            </Div>
            </Div>
            )
};
export default TimeSelector;
