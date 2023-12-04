//component that asks name of color scheme and saves it
import React, { useState, useRef,  useEffect} from "react"
import { Button, Input, Stack, Modal,
   ModalOverlay, ModalContent,
   ModalHeader,  ModalFooter, Text,
   ModalBody, ModalCloseButton
 } from '@chakra-ui/react'  
import {  usePopups } from "../../stores"
import  useSettings  from "../../stores/settingsStore"


function SaveColorScheme() {
  const btnRef = useRef<HTMLButtonElement>(null)
  const showSaveColorScheme = usePopups((state) => state.showSaveColorScheme)
  const setShowSaveColorScheme = usePopups((state) => state.setShowSaveColorScheme)
  const webColors = useSettings((state) => state.webColors)
  const setWebColors = useSettings((state) => state.setWebColors)
  const [ colorSchemeName, setColorSchemeName ] = useState("")
  const [addEnabled, setAddEnabled] = useState(false)
  const [ buttonName, setButtonName ] = useState("Save Color Scheme")
  const [ buttonColor, setButtonColor ] = useState("green")
  const cardColors = useSettings((state) => state.cardColors)

  const [ info, setInfo ] = useState("")

  function onModalClose() {
    setShowSaveColorScheme(false)
  }

  function addColors() {
    setWebColors({...webColors, [colorSchemeName]: cardColors})
    setColorSchemeName("")
    setShowSaveColorScheme(false)
  }
  useEffect(() => {
    if (colorSchemeName.length > 0 && !["Light", "Dark"].includes(colorSchemeName) &&  colorSchemeName.length < 20) {
      setAddEnabled(true)
    }else{
      setAddEnabled(false)
    }
    if(Object.keys(webColors).includes(colorSchemeName)){
      setButtonName("Overwrite")
      setButtonColor("red")
      setInfo("This will overwrite the existing color scheme")
    }else{
      setButtonName("Save")
      setButtonColor("green")
      setInfo("")
    }
    if(colorSchemeName.length >= 20){
      setInfo("Name must be less than 20 characters")
    }
  }, [colorSchemeName])

  return (
    <Modal
      isOpen={showSaveColorScheme}
      isCentered
      onClose={onModalClose}
      finalFocusRef={btnRef}
      key='xs'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader
          onMouseDown={e => e.preventDefault()}
        >
          Save Color Scheme
        </ModalHeader>
        <ModalBody>
          <Stack>
              <Input
                placeholder='Scheme name'
                value={colorSchemeName}
                onChange={(e) => { setColorSchemeName(e.target.value) } } 
              />
          </Stack>
          <Text color="rgba(255, 0, 0, 0.5)" mt={1}>
            {info}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='outline'
            mr={3}
            onClick={onModalClose}
          >
            Cancel
          </Button>
          <Button
            colorScheme={buttonColor}
            isDisabled={!addEnabled}
            onClick={addColors}
          >
            {buttonName}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SaveColorScheme
