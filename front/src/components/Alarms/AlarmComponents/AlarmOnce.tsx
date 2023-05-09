import { Center, Stack } from "@chakra-ui/react"
import TimeSelector from "./TimeSelector"
import DateSelector from "./DateSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import React from "react";
import AlarmTune from "./AlarmTune"
import AlarmToggles from "./AlarmToggles"

function AlarmOnce() {
    return (
        <Center>
            <Stack>
                <Message />
                <TimeSelector />
                <DateSelector />
                <DeviceChecker />
                <AlarmToggles />
                <AlarmTune />
            </Stack>
        </Center>
    )
}

export default AlarmOnce