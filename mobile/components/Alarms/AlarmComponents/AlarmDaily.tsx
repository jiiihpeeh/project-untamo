import { Div } from 'react-native-magnus'
import TimeSelector from "./TimeSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import React from "react"
import Active from './Active'

const AlarmDaily = () => {
    return(
            <Div>
                <Message />
                <Div >
                    <TimeSelector  />
                </Div>
                <Active/>
                <DeviceChecker />
            </Div>
       )
}

export default AlarmDaily