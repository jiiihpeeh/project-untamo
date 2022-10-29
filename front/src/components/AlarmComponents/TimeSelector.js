import React from "react";

import { 
        Input,
        FormLabel,
        HStack
     } from "@chakra-ui/react";

const nStr = (number) => {
    if(number < 10){
        return `0${number}`;
    }
    return `${number}`;
};
const TimeSelector = (props) => {
    const now = new Date();
    const hourNow = nStr(now.getHours() + 12);
    const minutesNow = nStr((Math.round(now.getMinutes()/10) % 6) * 10);
    const timeValue = (e) => {
        let timeArr = `${e}`.split(':');
        let minutes = parseInt(timeArr[1]);
        let hours = parseInt(timeArr[0]);
        if(!isNaN(minutes) && !isNaN(hours)){
            if(hours < 10)
            props.setTime(`${nStr(hours)}:${nStr(minutes)}`);
        }else{
            props.setTime(undefined);
        }
        console.log(e)
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
                   pattern="T[0-9]{2}:[0-9]{2}" 
                   onChange={(e) => timeValue(e.target.value)}
                   textShadow='1px 2px gray'
                   defaultValue={`${hourNow}:${minutesNow}`}
            />
            </HStack>
            </>
    )
};
export default TimeSelector;
