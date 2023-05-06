import { Center, Stack  } from "@chakra-ui/react"
import TimeSelector from "./TimeSelector"
import SelectedWeekdays from "./SelectWeekdays"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import AlarmTune from "./AlarmTune"
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
                <AlarmTune/>
            </Stack>
        </Center>
       )
}

export default AlarmWeekly