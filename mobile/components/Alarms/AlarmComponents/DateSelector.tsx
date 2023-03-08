import React from "react"
import DateModal from "./DateModal"
import { Text, Div } from 'react-native-magnus'
import useAlarm from "./alarmStates"

const DateSelector = (props) => {
    const date = useAlarm((state)=>state.date)
    const  setDate = useAlarm((state)=>state.setDate)
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
                    <DateModal
                        mode={props.mode}
                        date = {date}
                        setDate = {setDate}
                    />
                </Div>
            </Div>
        )
}
export default DateSelector
