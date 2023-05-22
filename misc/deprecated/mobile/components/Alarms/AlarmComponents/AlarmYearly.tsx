import { Div } from 'react-native-magnus'
import TimeSelector from "./TimeSelector"
import DateSelector from "./DateSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import React from "react"
import Active from './Active'
import AlarmTone from './AlarmTone'

const AlarmYearly = () => {
    return(
            <Div>
                <Message/>
                <Div 
                    row 
                    alignItems='center' 
                    ml={180}
                >
                    <TimeSelector/>
                    <Div 
                        ml={15}
                    >
                        <DateSelector/>
                    </Div>
                </Div>
                <Active/>
                <AlarmTone/>

                <DeviceChecker/>
            </Div>
       )
}

export default AlarmYearly