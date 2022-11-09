import React, { useContext } from "react";
import { AlarmComponentsContext } from "./AlarmComponentsContext";
import DateModal from "./DateModal";
import { Text, Div } from 'react-native-magnus';

const DateSelector = (props) => {
    const {date, setDate} = useContext(AlarmComponentsContext);
    return(<>
            <Div row>
                <Text>Date: </Text>
                <DateModal
                    mode={props.mode}
                    date = {date}
                    setDate = {setDate}
                />
            </Div>
        </>)
        
};
export default DateSelector;
