import { Text, Div, Input } from 'react-native-magnus';
import React, {useContext} from "react";
import { AlarmComponentsContext } from "./AlarmComponentsContext";
const Message = (props) => {
    const {label, setLabel} = useContext(AlarmComponentsContext);
    return(
        <Div row>
            <Text>Message</Text>
            <Input value={label} onChangeText= {(text) => setLabel(text)} style={{ flex: 1 }} m={10}/>
        </Div>          
    )
};
export default Message;
