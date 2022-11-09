
import { Div } from 'react-native-magnus';
import TimeSelector from "./TimeSelector";
import DateSelector from "./DateSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
const AlarmOnce = (props) => {
    return(
            <Div>
                <Message />
                <TimeSelector  />
                <DateSelector mode={'date'}/>
                <DeviceChecker/>
            </Div>
       )
}

export default AlarmOnce;