import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { Center, FormLabel , Flex } from "@chakra-ui/react";
import React, { useContext } from "react";
import { AlarmComponentsContext } from "./AlarmComponentsContext";
const DateSelector = (props) => {
    const {date, setDate} = useContext(AlarmComponentsContext);
    return(
        <Flex>
            <Center>
                <FormLabel>
                    Date
                </FormLabel>
                <SingleDatepicker
                    name="date-input"
                    date={date}
                    onDateChange={setDate}
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
