import { FormLabel , Input, Center, Flex } from "@chakra-ui/react";
import React, {useContext} from "react";
import { AlarmComponentsContext } from "./AlarmComponentsContext";
const Message = (props) => {
    const {label, setLabel} = useContext(AlarmComponentsContext);
    return(
        <Center>
        <Flex m={"1%"}>
            <FormLabel>Message</FormLabel>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </Flex>
        </Center>          
    )
};
export default Message;
