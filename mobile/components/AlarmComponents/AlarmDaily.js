import { Div } from 'react-native-magnus';
import TimeSelector from "./TimeSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
const AlarmDaily = (props) => {
    return(
            <Div>
                <Message />
                <Div ml={120}>
                    <TimeSelector  />
                </Div>
                
                <DeviceChecker />
            </Div>
       )
}

export default AlarmDaily;