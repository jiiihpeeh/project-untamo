import { Center, Stack, Spacer, Flex } from "@chakra-ui/react"
import TimeSelector from "./TimeSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import React from "react"
import AlarmTone from "./AlarmTone"
import AlarmToggles from "./AlarmToggles"

const AlarmDaily = () => {
    return(
        <Center>
            <Stack>
                <Message/>
                <TimeSelector/>
                <DeviceChecker/>
                <AlarmToggles/>
                <AlarmTone/>
            </Stack>
        </Center>
       )
}

export default AlarmDaily