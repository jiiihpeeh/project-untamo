import { Div } from 'react-native-magnus';
import TimeSelector from "./TimeSelector";
import SelectedWeekdays from "./SelectWeekdays";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
import Active from './Active';
const AlarmWeekly = (props) => {
    return(
        <Div >
            <Message />
            <Div ml={0} mb={10}>
                <TimeSelector/>
            </Div>
            <Div ml={0}>
                <SelectedWeekdays/>
            </Div>
            <Active/>
            <DeviceChecker/>
        </Div>
       )
}

export default AlarmWeekly;