import { Center, Stack } from "@chakra-ui/react"
import TimeSelector from "./TimeSelector"
import DateSelector from "./DateSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import React from "react";
import AlarmTone from "./AlarmTone"
import AlarmToggles from "./AlarmToggles"

const AlarmOnce = () => {
    return(
        <Center>
            <Stack>
                <Message />
                <TimeSelector  />
                <DateSelector/>
                <DeviceChecker/>
                <AlarmToggles/>
                <AlarmTone/>
            </Stack>
        </Center>
       )
}

export default AlarmOnce