import { Center, Stack } from "@chakra-ui/react"
import TimeSelector from "./TimeSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import React from "react"
import AlarmTone from "./AlarmTone"
import AlarmActive from "./AlarmActive"
const AlarmDaily = () => {
    return(
        <Center>
            <Stack>
                <Message/>
                <TimeSelector/>
                <DeviceChecker/>
                <AlarmActive/>
                <AlarmTone/>
            </Stack>
        </Center>
       )
}

export default AlarmDaily