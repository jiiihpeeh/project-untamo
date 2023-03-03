import { useDisclosure, Button,
		Drawer,DrawerBody,DrawerFooter,
		DrawerHeader,DrawerOverlay,
		DrawerContent, DrawerCloseButton,
		} from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'
import AlarmSelector from './AlarmComponents/AlarmSelector'
import { useAlarms, usePopups } from '../../stores'
import useAlarm  from './AlarmComponents/alarmStates'

const EditAlarm = () => {
	const editAlarm = useAlarms((state)=> state.editAlarm)
	const showEdit = usePopups((state)=> state.showEditAlarm)
	const toEdit = useAlarms((state)=> state.toEdit)
	const alarms = useAlarms((state)=> state.alarms) 
	const alarmFromDialog = useAlarm((state)=> state.alarmFromDialog) 
	const setShowEdit = usePopups((state)=> state.setShowEditAlarm) 
	const alarmToEditDialog = useAlarm((state)=> state.alarmToEditDialog) 

	const btnRef = useRef<any>(null)
	const { onOpen, onClose } = useDisclosure()

	const onEdit = async () => {
		let alarm = alarmFromDialog()
		console.log(alarm)
		if(alarm){
			editAlarm(alarm)
		}
		setShowEdit(false)
		onClose()
	}
	const onDrawerClose = () => {
		setShowEdit(false)
		onClose()
	}
	const onDrawerOpen = () => {
		setShowEdit(true)
	}
	useEffect(()=>{
		if(showEdit && toEdit){
			let alarm = alarms.filter(alarm => alarm.id === toEdit)[0]
			if(alarm){
				alarmToEditDialog(alarm)
			}
			onOpen()
		}
		
	},[showEdit])
	return (
		<>
			<Drawer
				isOpen={showEdit}
				placement='left'
				onClose={onDrawerClose}
				finalFocusRef={btnRef}
				size={'md'}
			>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerHeader>
						Edit Alarm
					</DrawerHeader>	
					<DrawerBody>
						<AlarmSelector/>
					</DrawerBody>
					<DrawerFooter>
						<Button 
							variant='outline' 
							mr={3} 
							onClick={onDrawerClose} 
							colorScheme="red"
						>
							Cancel
						</Button>
						<Button 
							colorScheme='green' 
							onClick={onEdit}
						>
							Save
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	)
}

export default EditAlarm

    