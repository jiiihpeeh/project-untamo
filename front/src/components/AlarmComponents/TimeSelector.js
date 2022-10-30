import React, {useContext} from "react";
import { timePadding } from "./timePadding";
import { 
        Input,
        FormLabel,
        HStack
     } from "@chakra-ui/react";

import { AlarmComponentsContext } from "./AlarmComponentsContext";

const TimeSelector = (props) => {
    const {time, setTime} = useContext(AlarmComponentsContext);
    const timeValue = (e) => {
        let timeArr = `${e}`.split(':');
        let minutes = parseInt(timeArr[1]);
        let hours = parseInt(timeArr[0]);
        if(!isNaN(minutes) && !isNaN(hours)){
            setTime(`${timePadding(hours)}:${timePadding(minutes)}`);
        }else{
            setTime(undefined);
        }
    }
    return( <>
            <HStack>
            <FormLabel>Time</FormLabel>
            <Input type="time" 
                   autocomplete  
                   className="timeBox"
                   fontSize="50px" 
                   width="195px" 
                   height="70px"
                   borderRadius="0px"
                   borderStyle="solid"
                   borderWidth="5px"
                   onChange={(e) => timeValue(e.target.value)}
                   textShadow='1px 2px gray'
                   value={time}
            />
            </HStack>
            </>
    )
};
export default TimeSelector;
