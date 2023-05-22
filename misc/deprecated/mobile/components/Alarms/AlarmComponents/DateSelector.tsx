import React from "react"
import DateModalDate from "./DateModalDate"
import { Text, Div } from 'react-native-magnus'

const DateSelector = () => {
    return(
            <Div 
                alignItems="center"
            >
                <Div 
                    row
                >
                    <Text>
                        Date: 
                    </Text>
                    <DateModalDate/>
                </Div>
            </Div>
        )
}
export default DateSelector
