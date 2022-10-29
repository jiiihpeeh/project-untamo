
import { Center, Stack } from "@chakra-ui/react";
import TimeSelector from "./TimeSelector";
import DateSelector from "./DateSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
const AlarmOnce = (props) => {
    return(
        <Center>
            <Stack>
                <Message label={props.label} setLabel={props.setLabel}/>
                <TimeSelector setTime={props.setTime} />
                <DateSelector setDate={props.setDate} date={props.date} dateFormat={'dd.MM.yyy'}/>
                <DeviceChecker selectedDevices={props.selectedDevices} setSelectedDevices={props.setSelectedDevices}/>
            </Stack>
        </Center>
       )
}

export default AlarmOnce;