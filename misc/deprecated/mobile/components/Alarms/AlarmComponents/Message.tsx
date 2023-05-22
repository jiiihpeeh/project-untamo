import { Text, Div, Input } from 'react-native-magnus'
import React from "react"
import useAlarm from './alarmStates'

const Message = () => {
    const label = useAlarm((state)=>state.label)
    const setLabel = useAlarm((state)=>state.setLabel)

    return(
        <Div 
            row
        >
            <Text>
                Message
            </Text>
            <Input 
                value={label} 
                onChangeText= {(text) => setLabel(text)} 
                style=  {
                            { 
                                flex: 1 
                            }
                        } 
                m={10}
            />
        </Div>          
    )
}
export default Message
