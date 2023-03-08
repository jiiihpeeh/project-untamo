
import { Div } from 'react-native-magnus'
import TimeSelector from "./TimeSelector"
import DateSelector from "./DateSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import React from "react"
import Active from './Active'
const AlarmOnce = () => {
    return(
            <Div>
                <Message />
                <Div 
                    alignItems='center'
                >
                <Div 
                    row 
                >
                    <TimeSelector/>
                    <Div 
                        ml={3}
                    >
                        <DateSelector/>
                    </Div>
                </Div>
                </Div>
                <Active/>
                <DeviceChecker/>
            </Div>
       )
}

export default AlarmOnce