import { Center, Stack } from "@chakra-ui/react"
import TimeSelector from "./TimeSelector"
import SelectedWeekdays from "./SelectWeekdays"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import AlarmTone from "./AlarmTone"
import React from "react"
import AlarmActive from "./AlarmActive"
import AlarmTask from "./AlarmTask";

const AlarmWeekly = () => {
    return(
        <Center>
            <Stack>
                <Message />
                <TimeSelector/>
                <SelectedWeekdays/>
                <DeviceChecker/>
                <AlarmActive/>
                <AlarmTask/>
                <AlarmTone/>
            </Stack>
        </Center>
       )
}

export default AlarmWeekly