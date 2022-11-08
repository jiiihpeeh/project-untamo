
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
                <Message />
                <TimeSelector  />
                <DateSelector  dateFormat={'dd.MM.yyy'}/>
                <DeviceChecker/>
            </Stack>
        </Center>
       )
}

export default AlarmOnce;