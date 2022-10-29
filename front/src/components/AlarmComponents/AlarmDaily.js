import { Center, Stack } from "@chakra-ui/react";
import TimeSelector from "./TimeSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
const AlarmDaily = (props) => {
    return(
        <Center>
            <Stack>
                <Message label={props.label} setLabel={props.setLabel}/>
                <TimeSelector setTime={props.setTime} />
                <DeviceChecker selectedDevices={props.selectedDevices} setSelectedDevices={props.setSelectedDevices}/>
            </Stack>
        </Center>
       )
}

export default AlarmDaily;