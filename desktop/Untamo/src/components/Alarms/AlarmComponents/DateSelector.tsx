import { SingleDatepicker } from "chakra-dayzed-datepicker"
import { Center, FormLabel , Flex } from "@chakra-ui/react"
import React from "react";
import useAlarm from "./alarmStates"

function DateSelector() {
    const date = useAlarm((state) => state.date);
    const dateFormat = useAlarm((state) => state.dateFormat);
    const setDate = useAlarm((state) => state.setDate);
    return (
        <Flex
            onMouseDown={e => e.preventDefault()}
        >
            <Center>
                <FormLabel>
                    Date
                </FormLabel>
                <SingleDatepicker
                    name="date-input"
                    date={date}
                    onDateChange={setDate}
                    configs={{
                        dateFormat: `${dateFormat}`,
                    }} />
            </Center>
        </Flex>

    );
}
export default DateSelector
