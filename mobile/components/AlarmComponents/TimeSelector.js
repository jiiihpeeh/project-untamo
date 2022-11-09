import React, {useContext, useState, useEffect } from "react";
import { timePadding } from "./timePadding";
import { Text, Div } from 'react-native-magnus';

import { AlarmComponentsContext } from "./AlarmComponentsContext";
import DateModal from "./DateModal";

const TimeSelector = (props) => {
    const {time, setTime} = useContext(AlarmComponentsContext);
    const dateSetter = () => {
        let timeArr = time.split(':');
        let dateTime = new Date();
        dateTime.setHours(timeArr[0]);
        dateTime.setMinutes(timeArr[1]);
        return dateTime;
    }
    
    const [ date, setDate ] = useState(dateSetter());

    
    useEffect(() => {
        setTime(`${timePadding(date.getHours)}:${timePadding(date.getMinutes)}`)
    },[date])

    return( <>  
            <Div row>
                <Text>Time: </Text>
                <DateModal
                    mode={'time'}
                    date = {date}
                    setDate ={setDate}
                />
            </Div>
            </>)
};
export default TimeSelector;
