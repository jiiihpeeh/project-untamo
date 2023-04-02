import React, { useRef } from "react"
import { AlertDialog,AlertDialogBody,AlertDialogFooter,AlertDialogHeader,
         AlertDialogContent,AlertDialogOverlay,Button } from '@chakra-ui/react'
import { useSettings, usePopups } from "../../stores"

const ChangeAlarmColors = () => {
    const setShowChangeColors = usePopups((state)=> state.setShowChangeColors)
    const showChangeColors = usePopups((state)=> state.showChangeColors)
    const setDefaultCardColors = useSettings((state)=> state.setDefaultCardColors)
    const cancelRef = useRef<HTMLButtonElement>(null)

    return (
        <AlertDialog
            isOpen={showChangeColors}
            leastDestructiveRef={cancelRef}
            onClose={()=>setShowChangeColors(false)}
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
  
              <AlertDialogBody>
                Do you want to change the alarm colors?
              </AlertDialogBody>
  
              <AlertDialogFooter>
                <Button 
                    ref={cancelRef} 
                    onClick={()=>setShowChangeColors(false)}
                >
                  Cancel
                </Button>
                <Button 
                    colorScheme='red' 
                    onClick= {() => {
                                      setShowChangeColors(false)
                                      setDefaultCardColors()
                                    }
                              } 
                    ml={3}
                >
                  OK
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
    )

}

export default ChangeAlarmColors