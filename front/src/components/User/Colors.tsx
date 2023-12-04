import { HexColorPicker } from "react-colorful"
import React, { useState, useEffect } from "react"
import { usePopups, useSettings } from "../../stores"
import { Spacer, HStack, Button, VStack, Modal,
         ModalOverlay, ModalContent, Divider,
         ModalHeader, ModalBody, ModalCloseButton, Center } from '@chakra-ui/react'
import { CardColors } from "../../stores/settingsStore"
import LoadColorScheme from "./LoadColors"

function Color() {
    const showColor = usePopups((state) => state.showColor)
    const setShowColor = usePopups((state) => state.setShowColor)
    const cardColors = useSettings((state) => state.cardColors)
    const setCardColors = useSettings((state) => state.setCardColors)
    const setDefaultCardColors = useSettings((state) => state.setDefaultCardColors)
    const setShowSaveColorScheme = usePopups((state) => state.setShowSaveColorScheme)
    const [color, setColor] = useState(cardColors.odd)
    const [mode, setMode] = useState<keyof CardColors>("odd")

    useEffect(() => {
        setCardColors(color, mode)
    }, [color])
    useEffect(() => {
        setColor(cardColors[mode])
    }, [mode])

    return (
        <Modal
            blockScrollOnMount={false}
            isOpen={showColor}
            onClose={() => setShowColor(false)}
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
                        <VStack>
                            <HexColorPicker
                                color={color}
                                onChange={setColor} />
                            <Center>
                                <VStack>
                                    <Button
                                        onClick={() => setShowSaveColorScheme(true)}
                                    >
                                        Save Theme
                                    </Button>
                                    <LoadColorScheme />
                                </VStack>
                            </Center>
                        </VStack>
                        <VStack>
                            <Button
                                background={cardColors.odd}
                                width={200}
                                onClick={() => setMode("odd")}
                            >
                                Odd
                            </Button>
                            <Button
                                background={cardColors.even}
                                width={200}
                                onClick={() => setMode("even")}
                            >
                                Even
                            </Button>
                            <Button
                                background={cardColors.inactive}
                                width={200}
                                onClick={() => setMode("inactive")}
                            >
                                Inactive
                            </Button>
                            <Button
                                background={cardColors.background}
                                width={200}
                                onClick={() => setMode("background")}
                            >
                                Background
                            </Button>
                            <Divider />
                            <Spacer />
                            <Button
                                width={200}
                                onClick={() => { setDefaultCardColors() } }
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