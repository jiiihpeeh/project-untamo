import { FormLabel , Input, Center, Flex } from "@chakra-ui/react";
import React from "react";

const Message = (props) => {
    return(
        <Center>
        <Flex m={"1%"}>
            <FormLabel>Message</FormLabel>
            <Input value={props.label} onChange={(e) => props.setLabel(e.target.value)} />
        </Flex>
        </Center>          
    )
};
export default Message;
