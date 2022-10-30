import { Center, Stack } from "@chakra-ui/react";
import TimeSelector from "./TimeSelector";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";
const AlarmDaily = (props) => {
    return(
        <Center>
            <Stack>
                <Message />
                <TimeSelector  />
                <DeviceChecker />
            </Stack>
        </Center>
       )
}

export default AlarmDaily;