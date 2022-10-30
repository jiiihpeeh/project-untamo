import { Center, Stack } from "@chakra-ui/react";
import TimeSelector from "./TimeSelector";
import SelectedWeekdays from "./SelectWeekdays";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import React from "react";

const AlarmWeekly = (props) => {
    return(
        <Center>
            <Stack>
                <Message />
                <TimeSelector/>
                <SelectedWeekdays/>
                <DeviceChecker/>
            </Stack>
        </Center>
       )
}

export default AlarmWeekly;