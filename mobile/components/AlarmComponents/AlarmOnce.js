
import { Div } from 'react-native-magnus';
import TimeSelector from "./TimeSelector";
import DateSelector from "./DateSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
import Active from './Active';
const AlarmOnce = (props) => {
    return(
            <Div>
                <Message />
                <Div row alignItems='center' >
                    <TimeSelector  />
                    <Div>
                        <DateSelector mode={'date'}/>
                    </Div>
                </Div>
                <Active/>
                <DeviceChecker/>
            </Div>
       )
}

export default AlarmOnce;