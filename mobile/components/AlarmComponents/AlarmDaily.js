import { Div } from 'react-native-magnus';
import TimeSelector from "./TimeSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
const AlarmDaily = (props) => {
    return(
            <Div>
                <Message />
                <TimeSelector  />
                <DeviceChecker />
            </Div>
       )
}

export default AlarmDaily;