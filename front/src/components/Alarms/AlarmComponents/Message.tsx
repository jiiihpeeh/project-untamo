import { FormLabel , Input, Center, Flex } from "@chakra-ui/react"
import React from "react"
import useAlarm  from "./alarmStates"
const Message = () => {
    const label= useAlarm((state)=> state.label)
    const setLabel = useAlarm((state)=> state.setLabel)
    return(
        <Center>
            <Flex 
                m={"1%"}
            >
                <FormLabel
                    onMouseDown={e=>e.preventDefault()}
                >
                    Message
                </FormLabel>
                <Input 
                    value={label} 
                    onChange={(e) => setLabel(e.target.value)} 
                />
            </Flex>
        </Center>          
    )
}
export default Message
