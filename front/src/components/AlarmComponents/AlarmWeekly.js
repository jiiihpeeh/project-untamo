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
                <Message label={props.label} setLabel={props.setLabel}/>
                <TimeSelector setTime={props.setTime} time={props.time}  />
                <SelectedWeekdays setDays={props.setWeekdays} days={props.weekdays}/>
                <DeviceChecker selectedDevices={props.selectedDevices} setSelectedDevices={props.setSelectedDevices}/>
            </Stack>
        </Center>
       )
}

export default AlarmWeekly;