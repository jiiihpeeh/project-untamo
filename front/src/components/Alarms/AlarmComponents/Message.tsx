import { FormLabel , Input, Center, Flex, HStack, VStack, Button } from "@chakra-ui/react"
import React, { useState} from "react"
import useAlarm  from "./alarmStates"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

const Message = () => {
    const label= useAlarm((state)=> state.label)
    const setLabel = useAlarm((state)=> state.setLabel)
    const [ showEmoji, setShowEmoji ]  = useState(false)

    function onEmojiSelect(emoji: { native: string }) {
        setLabel(label+emoji.native)
    }

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
                <VStack>
                    <HStack>
                        <Input 
                            value={label} 
                            onChange={(e) => setLabel(e.target.value)} 
                        />
                        <Button
                            onClick={()=>setShowEmoji(!showEmoji)}
                        >
                            ⏰
                        </Button>
                </HStack>
                {showEmoji &&
                    <Picker 
                        data={data} 
                        onEmojiSelect={onEmojiSelect} 
                    />}
                </VStack>
            </Flex>
        </Center>          
    )
}
export default Message
