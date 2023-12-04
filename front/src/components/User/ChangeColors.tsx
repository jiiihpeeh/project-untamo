import React, { useRef } from "react"
import { AlertDialog,AlertDialogBody,AlertDialogFooter,AlertDialogHeader,
         AlertDialogContent,AlertDialogOverlay,Button, AlertDialogCloseButton, Spacer } from '@chakra-ui/react'
import { useSettings, usePopups } from "../../stores"
import LoadColorScheme from "./LoadColors"

  

function ChangeAlarmColors() {
  const setShowChangeColors = usePopups((state) => state.setShowChangeColors)
  const showChangeColors = usePopups((state) => state.showChangeColors)
  const setDefaultCardColors = useSettings((state) => state.setDefaultCardColors)
  const cancelRef = useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog
      isOpen={showChangeColors}
      leastDestructiveRef={cancelRef}
      onClose={() => setShowChangeColors(false)}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader
            fontSize='lg'
            fontWeight='bold'
          >
            Color Mode Change
          </AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Do you want to change the alarm colors?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={() => setShowChangeColors(false)}
              colorScheme='red'
            >
              Cancel
            </Button>
            <Spacer  />
            <LoadColorScheme  
              setter={setShowChangeColors}
              setterValue={false}
            />
            <Button
              colorScheme='green'
              onClick={() => {
                setShowChangeColors(false)
                setDefaultCardColors()
              } }
              ml={3}
            >
              Default
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )

}

export default ChangeAlarmColors