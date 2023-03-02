import {
    AlertDialog, useDisclosure,
    AlertDialogOverlay, AlertDialogContent, 
    AlertDialogHeader, AlertDialogBody, 
    AlertDialogFooter, Button } from '@chakra-ui/react'
import React, { useRef, useEffect, useState } from 'react'
import { useAdmin, usePopups } from '../../stores'
import { AdminAction } from '../../type.d'

const AdminChangeActivity = () => {
    const [ message, setMessage ] = useState({action:'', message:'', button:''})
    const { onClose } = useDisclosure()
    const cancelRef = useRef<HTMLButtonElement>(null)
    const runAdminAction = useAdmin((state)=>state.adminAction)
    const setShowAdminConfirm = usePopups((state)=>state.setShowAdminConfirm)
    const showAdminConfirm = usePopups((state)=>state.showAdminConfirm)
    const command = useAdmin((state) => state.command)

    const cancelDialog = () => {
        setShowAdminConfirm(false)
        onClose()
    }

    const acceptChange = async () => {
        runAdminAction()
        setShowAdminConfirm(false)
        onClose()        
    }
    useEffect(() => {
        switch(command.action){
            case AdminAction.Delete:
                setMessage({action: 'Delete?', 
                            message: 'Delete user? User information will be erased.',
                            button: 'Delete user'
                        })
                break
            case AdminAction.Admin:
                setMessage({ action: 'Admin Status',
                             message: 'Admin status of the user will be changed',
                             button: "Change Admin Status" 
                            })
                break
            case AdminAction.Activity:
                setMessage({ action: 'Activity Status', 
                            message: 'Activity status of the user will be changed. Current sessions will be erased if accepted and activity is turned OFF',
                            button: "Change Activity Status"
                        })
                break
            default:
                break
        }
    },[command])


    return (
      <>
        <AlertDialog
          isOpen={showAdminConfirm}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
        <AlertDialogOverlay>
        <AlertDialogContent>
            <AlertDialogHeader 
                fontSize='lg' 
                fontWeight='bold'
            >
                {message.action}
            </AlertDialogHeader>
            <AlertDialogBody>
                {message.message}
            </AlertDialogBody>
            <AlertDialogFooter>
            <Button 
                ref={cancelRef} 
                onClick={cancelDialog}
            >
                Cancel
            </Button>
            <Button 
                colorScheme='red' 
                onClick={acceptChange} 
                ml={3}
            >
                {message.button}
            </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialogOverlay>
        </AlertDialog>
      </>
    )
  }

  export default AdminChangeActivity