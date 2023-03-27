import { Center, Stack,  Spacer,   Flex  } from "@chakra-ui/react"
import TimeSelector from "./TimeSelector"
import SelectedWeekdays from "./SelectWeekdays"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import AlarmTone from "./AlarmTone"
import React from "react"
import AlarmToggles from "./AlarmToggles"

const AlarmWeekly = () => {
    return(
        <Center>
            <Stack>
                <Message />
                <TimeSelector/>
                <SelectedWeekdays/>
                <DeviceChecker/>
                <AlarmToggles/>
                <AlarmTone/>
            </Stack>
        </Center>
       )
}

export default AlarmWeekly