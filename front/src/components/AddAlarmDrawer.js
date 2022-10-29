import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Button,
    Input,
    Center,
    useDisclosure,
    HStack,
    VStack,
    Stack,
    Divider
  } from '@chakra-ui/react';
import React , { useRef, useState, useEffect } from 'react';
import { timePadding } from './AlarmComponents/timePadding';
import AlarmSelector from './AlarmComponents/AlarmSelector';
import AlarmCase from './AlarmComponents/AlarmCase';

const currentTime = () => {
  return `${timePadding(new Date().getHours())}:${timePadding(new Date().getMinutes())}`
}
const AddAlarmDrawer = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef();
    const [ time, setTime ] = useState(currentTime());
    const [date, setDate] = useState(new Date());
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [weekdays, setWeekdays] = useState([]);
    const [ label, setLabel ] = useState('Alarm');
    const [alarmCase, setAlarmCase ] = useState('weekly');
  

    const closeDrawer = () => {
      onClose();
    };
    useEffect(() => {
        console.log(time)
        console.log(date)
    },[time,date])
    return (
      <>
        <Button ref={btnRef} colorScheme='teal' 
                borderRadius="50%" width={"50px"} 
                height={"50px"}  boxShadow="2px 2px green" 
                textShadow={"2px 2px gray"} 
                fontSize="4xl" onClick={onOpen}
                float={"bottom"}
                >
          +
        </Button>
        <Drawer
          isOpen={isOpen}
          placement='left'
          onClose={closeDrawer}
          finalFocusRef={btnRef}
          size="md"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Set up an alarm</DrawerHeader>
  
            <DrawerBody>
            <AlarmCase  alarmCase={alarmCase}
                        setAlarmCase={setAlarmCase}
            />
            <Divider m={'5px'}/>
            <AlarmSelector alarmCase={alarmCase}
                           time={time} 
                           setTime={setTime} 
                           setDate={setDate} 
                           date={date} 
                           selectedDevices={selectedDevices} 
                           setSelectedDevices={setSelectedDevices} 
                           label={label} 
                           setLabel={setLabel}
                           weekdays={weekdays}
                           setWeekdays={setWeekdays}  
                       />
            </DrawerBody>
  
            <DrawerFooter>
              <Button variant='outline' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='blue'>Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  export default AddAlarmDrawer;