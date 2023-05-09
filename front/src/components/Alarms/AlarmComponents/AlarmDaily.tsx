import { Center, Stack } from "@chakra-ui/react"
import TimeSelector from "./TimeSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import React from "react"
import AlarmTune from "./AlarmTune"
import AlarmToggles from "./AlarmToggles"

function AlarmDaily() {
    return (
        <Center>
            <Stack>
                <Message />
                <TimeSelector />
                <DeviceChecker />
                <AlarmToggles />
                <AlarmTune />
            </Stack>
        </Center>
    )
}

export default AlarmDaily