import { Center, Stack } from "@chakra-ui/react";
import TimeSelector from "./TimeSelector";
import SelectedWeekdays from "./SelectWeekdays";
import DeviceChecker from "./DeviceChecker";
import Message from "./Message";
import AlarmTone from "./AlarmTone";
import React from "react";

const AlarmWeekly = () => {
    return(
        <Center>
            <Stack>
                <Message />
                <TimeSelector/>
                <SelectedWeekdays/>
                <DeviceChecker/>
                <AlarmTone/>
            </Stack>
        </Center>
       )
}

export default AlarmWeekly;