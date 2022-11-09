import { Div } from 'react-native-magnus';
import TimeSelector from "./TimeSelector";
import DateSelector from "./DateSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";

const AlarmYearly = (props) => {
    return(
            <Div>
                <Message />
                <TimeSelector  />
                <DateSelector mode={'date-no-year'}/>
                <DeviceChecker/>
            </Div>
       )
};

export default AlarmYearly;