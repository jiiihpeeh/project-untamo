import { HexColorPicker } from "react-colorful"
import React, { useState, useEffect } from "react"
import { usePopups, useSettings } from "../../stores"
import { Spacer, HStack, Button, VStack, Modal,
         ModalOverlay, ModalContent, Divider,
         ModalHeader, ModalBody, ModalCloseButton } from '@chakra-ui/react'

const Color = () => {
    const showColor = usePopups((state)=>state.showColor)
    const setShowColor = usePopups((state)=>state.setShowColor)
    const cardColors = useSettings((state)=>state.cardColors)
    const setCardColors = useSettings((state)=>state.setCardColors)
    const setDefaultCardColors = useSettings((state)=>state.setDefaultCardColors)

    const [color, setColor] = useState(cardColors.uneven)
    const [mode, setMode] = useState("uneven")

    useEffect(()=>{
        setCardColors(color, mode)
    },[color])
    useEffect(()=>{
        //@ts-ignore
        setColor(cardColors[mode])
    },[mode])
    
    return (<Modal
                blockScrollOnMount={false} 
                isOpen={showColor} 
                onClose={()=>setShowColor(false)}
                isCentered
            >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    Set Alarm Colors
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <HStack>
                    <HexColorPicker color={color} onChange={setColor} />
                    <VStack>
                        <Button
                            background={cardColors.odd}
                            width={200}
                            onClick={()=>setMode("odd")}
                        >
                            Odd
                        </Button>
                        <Button
                            background={cardColors.even}
                            width={200}
                            onClick={()=>setMode("even")}

                        >
                            Even
                        </Button>
                        <Button
                            background={cardColors.inactive}
                            width={200}
                            onClick={()=>setMode("inactive")}
                        >
                            Inactive
                        </Button>
                        <Divider/>
                        <Spacer/>
                        <Button
                            width={200}
                            onClick={()=>{setDefaultCardColors()}}
                        >
                            Default
                        </Button>
                        
                    </VStack>
                    </HStack>
                </ModalBody>
                </ModalContent>
            </Modal>
        )
}

export default Color