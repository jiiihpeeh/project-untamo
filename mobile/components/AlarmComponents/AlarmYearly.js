import { Div } from 'react-native-magnus';
import TimeSelector from "./TimeSelector";
import DateSelector from "./DateSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
import Active from './Active';
const AlarmYearly = (props) => {
    return(
            <Div>
                <Message />
                <Div row alignItems='center' ml={90}>
                    <TimeSelector  />
                    <Div ml={15}>
                        <DateSelector mode={'date-no-year'}/>
                    </Div>
                </Div>
                <Active/>
                <DeviceChecker/>
            </Div>
       )
};

export default AlarmYearly;