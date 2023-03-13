import { useDisclosure,Button, Text,
		Tooltip,Drawer, DrawerBody,
		DrawerFooter,DrawerHeader,
		DrawerOverlay,DrawerContent,
		DrawerCloseButton, } from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'
import AlarmSelector from './AlarmComponents/AlarmSelector'
import useAlarm from './AlarmComponents/alarmStates'
import { useAlarms, usePopups } from '../../stores'


function AddAlarm() {
	const btnRef = useRef<HTMLButtonElement>(null)
	const onAddOpen = useAlarm((state)=>state.onAddOpen)
	const addNewAlarm = useAlarms((state) => state.addNewAlarm)
	const setShowToast = usePopups((state)=>state.setShowToast)
	const showAddAlarm = usePopups((state)=>state.showAddAlarm)
	const setShowAddAlarm = usePopups((state)=>state.setShowAddAlarm)
	const alarmFromDialog = useAlarm((state)=> state.alarmFromDialog) 

	const onAdd = async (event:any) => {
		event.currentTarget.disabled = true
		let alarm = alarmFromDialog()
		if(alarm){
			addNewAlarm(alarm)
		}
		setShowAddAlarm(false)
		setShowToast(true)
	}
	const onDrawerClose = () => {
		setShowToast(true)
		setShowAddAlarm(false)
	}
	const onDrawerOpen = () => {
		setShowToast(false)

		onAddOpen()
		setShowAddAlarm(true)
	}


	return (
		<>
		<Drawer
			isOpen={showAddAlarm}
			placement='left'
			onClose={onDrawerClose}
			finalFocusRef={btnRef}
			size={'md'}
		>
		<DrawerOverlay />
		<DrawerContent>
			<DrawerCloseButton />
			<DrawerHeader>
				Add an alarm
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
					onClick={onAdd}
				>
						Save
				</Button>
			</DrawerFooter>
		</DrawerContent>
	</Drawer>	
	</>
	)
}

export default AddAlarm