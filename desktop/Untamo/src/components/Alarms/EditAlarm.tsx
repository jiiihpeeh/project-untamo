import { useDisclosure, Button, Drawer,DrawerBody,
         Spacer,  DrawerHeader,DrawerOverlay,
         DrawerContent, DrawerCloseButton, Flex} from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'
import AlarmSelector from './AlarmComponents/AlarmSelector'
import { useAlarms, usePopups } from '../../stores'
import useAlarm  from './AlarmComponents/alarmStates'

function EditAlarm() {
   const editAlarm = useAlarms((state) => state.editAlarm)
   const showEdit = usePopups((state) => state.showEditAlarm)
   const isMobile = usePopups((state) => state.isMobile)
   const toEdit = useAlarms((state) => state.toEdit)
   const alarms = useAlarms((state) => state.alarms)
   const alarmFromDialog = useAlarm((state) => state.alarmFromDialog)
   const setShowEdit = usePopups((state) => state.setShowEditAlarm)
   const alarmToEditDialog = useAlarm((state) => state.alarmToEditDialog)
   const btnRef = useRef<any>(null)
   const { onOpen, onClose } = useDisclosure()

   async function onEdit() {
      let alarm = alarmFromDialog()
      if (alarm) {
         editAlarm(alarm)
      }
      setShowEdit(false)
      onClose()
   }
   function onDrawerClose() {
      setShowEdit(false)
      onClose()
   }
   useEffect(() => {
      if (showEdit && toEdit) {
         let alarm = alarms.filter(alarm => alarm.id === toEdit)[0]
         if (alarm) {
            alarmToEditDialog(alarm)
         }
         onOpen()
      }

   }, [showEdit])
   return (
      <Drawer
         isOpen={showEdit}
         placement='left'
         onClose={onDrawerClose}
         finalFocusRef={btnRef}
         size={(isMobile) ? 'full' : "md"}
      >
         <DrawerOverlay />
         <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
               Edit Alarm
            </DrawerHeader>
            <DrawerBody>
               <AlarmSelector />
               <Flex m={"15%"}>
                  <Button
                     variant='outline'
                     mr={3}
                     onClick={onDrawerClose}
                     colorScheme="red"
                  >
                     Cancel
                  </Button>
                  <Spacer />
                  <Button
                     colorScheme='green'
                     onClick={onEdit}
                  >
                     Save
                  </Button>
               </Flex>
            </DrawerBody>
         </DrawerContent>
      </Drawer>
   )
}

export default EditAlarm
