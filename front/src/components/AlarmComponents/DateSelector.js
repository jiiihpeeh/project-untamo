import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { Center, FormLabel , Flex } from "@chakra-ui/react";
import React from "react";

const DateSelector = (props) => {
    return(
        <Flex>
        <Center>
        <FormLabel>Date</FormLabel>
        <SingleDatepicker
            name="date-input"
            date={props.date}
            onDateChange={props.setDate}
            configs={{
                dateFormat: `${props.dateFormat}`,
                }
            }
        />        
        </Center>
        </Flex>
        
    )
};
export default DateSelector;
