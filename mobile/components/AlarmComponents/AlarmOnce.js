
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
                <Div row alignItems='center' ml={90}>
                    <TimeSelector  />
                    <Div ml={15}>
                        <DateSelector mode={'date'}/>
                    </Div>
                </Div>
                <DeviceChecker/>
            </Div>
       )
}

export default AlarmOnce;