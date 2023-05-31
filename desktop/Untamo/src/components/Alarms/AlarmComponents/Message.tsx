import { FormLabel , Input, Center, Flex, HStack, VStack, Button } from "@chakra-ui/react"
import React, { useState} from "react"
import useAlarm  from "./alarmStates"
import Picker from '@emoji-mart/react'
import  useSettings  from "../../../stores/settingsStore"
import  useEmojiStore, { Skin }  from "../../../stores/emojiStore"

const Message = () => {
    const label= useAlarm((state)=> state.label)
    const setLabel = useAlarm((state)=> state.setLabel)
    const [ showEmoji, setShowEmoji ]  = useState(false)
    const isLight = useSettings((state)=>state.isLight)
    const data = useEmojiStore((state)=>state.getEmojiData)()

    function onEmojiSelect(emoji :Skin) {
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
                    {  showEmoji ?
                    <Picker 
                        data={data} 
                        onEmojiSelect={onEmojiSelect}
                        theme={isLight ? 'light' : 'dark'}
                        width={300}
                    />
                    :
                    <></>
                    }
                </VStack>
            </Flex>
        </Center>          
    )
}
export default Message
