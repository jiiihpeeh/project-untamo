import {  Button, AlertDialog, 
            AlertDialogBody,AlertDialogFooter, 
            AlertDialogHeader,AlertDialogContent, 
            AlertDialogOverlay } from '@chakra-ui/react'
import React, { useRef } from 'react'
import { usePopups,useLogIn } from '../../stores'


function ClearSettings() {
    const logOut = useLogIn((state) => state.logOut)
    const setShowSettings = usePopups((state) => state.setShowSettings)
    const setShowClearSettings = usePopups((state) => state.setShowClearSettings)
    const showClearSettings = usePopups((state) => state.showClearSettings)
    const cancelRef = useRef<HTMLButtonElement>(null)

    return (  
            <AlertDialog
                isOpen={showClearSettings}
                leastDestructiveRef={cancelRef}
                onClose={() => setShowClearSettings(false)}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader 
                            fontSize='lg' 
                            fontWeight='bold'
                        >
                            Clear settings and Log Out
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button 
                                ref={cancelRef} 
                                onClick={() => {setShowClearSettings(false)}}
                            >
                                Cancel
                            </Button>
                            <Button 
                                colorScheme='red' 
                                onClick= {() => {
                                                    logOut()
                                                    localStorage.clear()
                                                    setShowSettings(false)
                                                    window.location.reload()
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

export default ClearSettings