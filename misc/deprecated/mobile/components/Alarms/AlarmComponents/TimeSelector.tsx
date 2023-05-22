import React from "react"
import { Text, Div } from 'react-native-magnus'
import DateModalTime from "./DateModalTime"

const TimeSelector = () => {
    return(
            <Div 
                alignItems="center"
            >
                <Div  
                    row
                >
                    <Text>
                        Time: 
                    </Text>
                    <DateModalTime/>
                </Div>
            </Div>
        )
}
export default TimeSelector
