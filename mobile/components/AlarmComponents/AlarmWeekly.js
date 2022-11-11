import { Div } from 'react-native-magnus';
import TimeSelector from "./TimeSelector";
import SelectedWeekdays from "./SelectWeekdays";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
import Active from './Active';
const AlarmWeekly = (props) => {
    return(
        <Div>
            <Message />
            <Div ml={150} mb={10}>
                <TimeSelector/>
            </Div>
            <SelectedWeekdays/>
            <Active/>
            <DeviceChecker/>
        </Div>
       )
}

export default AlarmWeekly;