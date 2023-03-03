import {
	Button, AlertDialog, 
	AlertDialogBody,AlertDialogFooter, 
	AlertDialogHeader,AlertDialogContent, 
	AlertDialogOverlay } from '@chakra-ui/react'
import React, { useRef } from 'react'
import {  useAlarms, usePopups } from '../../stores'


function DeleteAlarm() {
	const showDelete = usePopups((state)=> state.showDeleteAlarm) 
	const setShowDelete = usePopups((state)=> state.setShowDeleteAlarm) 
	const deleteAlarm  = useAlarms((state)=>state.deleteAlarm)
	const alarms  = useAlarms((state)=>state.alarms)
	const toDelete  = useAlarms((state)=>state.toDelete)
	let alarm = alarms.filter(a => a.id === toDelete)[0]
	const cancelRef = useRef<HTMLButtonElement>(null)

	return ( <>{alarm && <>
        <AlertDialog
            isOpen={showDelete}
            leastDestructiveRef={cancelRef}
            onClose={() => {setShowDelete(false)}}
        >
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader 
						fontSize='lg' 
						fontWeight='bold'
					>
						Delete alarm ({alarm.occurence}, {alarm.time} for {alarm.devices.length} devices)?
					</AlertDialogHeader>
					<AlertDialogBody>
						Are you sure?
					</AlertDialogBody>
					<AlertDialogFooter>
						<Button 
							ref={cancelRef} 
							onClick={() => {setShowDelete(false)}}
						>
							Cancel
						</Button>
						<Button 
							colorScheme='red' 
							onClick= {() => {deleteAlarm() ; setShowDelete(false)}} 
							ml={3}
						>
							OK
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
		</>}</>
		)
	}

export default DeleteAlarm