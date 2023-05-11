import { Button, Drawer, DrawerBody,
    DrawerHeader,
    DrawerOverlay,DrawerContent,
    DrawerCloseButton,
    Flex, Spacer } from '@chakra-ui/react'
import React, { useRef } from 'react'
import AlarmSelector from './AlarmComponents/AlarmSelector'
import useAlarm from './AlarmComponents/alarmStates'
import { useAlarms, usePopups } from '../../stores'


function AddAlarm() {
    const btnRef = useRef<HTMLButtonElement>(null)
    const addNewAlarm = useAlarms((state) => state.addNewAlarm)
    const setShowToast = usePopups((state)=>state.setShowToast)
    const showAddAlarm = usePopups((state)=>state.showAddAlarm)
    const setShowAddAlarm = usePopups((state)=>state.setShowAddAlarm)
    const alarmFromDialog = useAlarm((state)=> state.alarmFromDialog) 
    const isMobile = usePopups((state)=> state.isMobile)

    async function onAdd(event: any) {
        event.currentTarget.disabled = true
        let alarm = alarmFromDialog()
        if (alarm) {
            addNewAlarm(alarm)
        }
        setShowAddAlarm(false)
        setShowToast(true)
    }
    function onDrawerClose() {
        setShowToast(true)
        setShowAddAlarm(false)
    }

    return (
        <Drawer
            isOpen={showAddAlarm}
            placement='left'
            onClose={onDrawerClose}
            finalFocusRef={btnRef}
            size={(isMobile)?'full':'md'}
        >
        <DrawerOverlay />
                <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>
                    Add an alarm
                </DrawerHeader>	
                <DrawerBody>
                    <AlarmSelector/>
                    <Flex m={"15%"}>
                        <Button 
                            variant='outline' 
                            mr={3} 
                            onClick={onDrawerClose} 
                            colorScheme="red"
                        >
                            Cancel
                        </Button>
                        <Spacer/>
                        <Button 
                            colorScheme='green' 
                            onClick={onAdd}
                        >
                                Save
                        </Button>
                    </Flex>
                </DrawerBody>
                </DrawerContent>
            </Drawer>
        )
}

export default AddAlarm