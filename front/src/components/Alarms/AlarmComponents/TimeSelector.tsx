import React from "react"
import { Input, FormLabel, HStack } from "@chakra-ui/react"
import useAlarm from "./alarmStates"

const TimeSelector = () => {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)

    return( <>
            <HStack>
                <FormLabel>
                    Time
                </FormLabel>
                <Input 
                    type="time" 
                    autoComplete  = {"true"}
                    className="timeBox"
                    fontSize="50px" 
                    width="195px" 
                    height="70px"
                    borderRadius="0px"
                    borderStyle="solid"
                    borderWidth="5px"
                    onChange={(e) => setTime(e.target.value)}
                    textShadow='1px 2px gray'
                    value={time}
                />
            </HStack>
            </>
    )
}
export default TimeSelector
