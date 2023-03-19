import React, { useRef } from "react"
import {
    AlertDialog,AlertDialogBody,AlertDialogFooter,AlertDialogHeader,
    AlertDialogContent,AlertDialogOverlay,Button
  } from '@chakra-ui/react'
import { useLogIn, usePopups } from "../../stores"

const LogOut = () => {
    const sessionLogOut = useLogIn((state) => state.logOut)
    const setShowLogOut = usePopups((state)=> state.setShowLogOut)
    const showLogOut = usePopups((state)=> state.showLogOut)
    const cancelRef = useRef<HTMLButtonElement>(null)

    return (
        <AlertDialog
            isOpen={showLogOut}
            leastDestructiveRef={cancelRef}
            onClose={()=>setShowLogOut(false)}
            isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader 
                fontSize='lg' 
                fontWeight='bold'
              >
                Log Out?
              </AlertDialogHeader>
  
              <AlertDialogBody>
                Are you sure?
              </AlertDialogBody>
  
              <AlertDialogFooter>
                <Button 
                    ref={cancelRef} 
                    onClick={()=>setShowLogOut(false)}
                >
                  Cancel
                </Button>
                <Button 
                    colorScheme='red' 
                    onClick= {() => {sessionLogOut() ; setShowLogOut(false)}} 
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

export default LogOut