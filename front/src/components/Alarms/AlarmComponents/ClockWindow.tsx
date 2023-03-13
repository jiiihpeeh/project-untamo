     

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody, HStack,
    ModalCloseButton, Button, Box
  } from '@chakra-ui/react'
import CircularSlider from '@fseehawer/react-circular-slider';  
import { timePadding } from './stringifyDate-Time';
import useAlarm from './alarmStates'
import React, { useEffect, useState } from 'react'
import { usePopups } from '../../../stores';

  function ClockWindow() {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)
    const showTimepicker = usePopups((state)=> state.showTimepicker)
    const setShowTimepicker = usePopups((state)=> state.setShowTimepicker)
    const [parsedTime, setParsedTime] = useState({hours: "0", minutes: "0"})

    useEffect(()=>{
        let timeArr = time.split(":")
        setParsedTime({hours: `${parseInt(timeArr[0])}`, minutes: `${parseInt(timeArr[1])}`})
    }, [time, showTimepicker])


    let hours: Array<string> = []
    for(let i = 0; i<24; i++){
        hours.push(`${i}`)
    }
    let minutes: Array<string> = []
    for(let i = 0; i<60; i++){
        minutes.push(`${i}`)
    }
    const acceptTime = () => {
        setTime(`${timePadding(parseInt(parsedTime.hours))}:${timePadding(parseInt(parsedTime.minutes))}`)
    }

    return (
      <>
        <Modal 
            isOpen={showTimepicker} 
            onClose={()=>setShowTimepicker(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
                Set Time
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <HStack>
            <CircularSlider
                width={190}
                label="hours"
                labelColor="#005a58"
                knobColor="#005a58"
                progressColorFrom="#00bfbd"
                progressColorTo="#009c9a"
                progressSize={20}
                trackColor="#eeeeee"
                trackSize={20}
                data={hours} 
                dataIndex={hours.indexOf(parsedTime.hours)}
                //@ts-ignore
                onChange={ value  => setParsedTime({...parsedTime, hours: value}) }
            />
            <Box></Box>
            <CircularSlider
                width={190}
                label="minutes"
                labelColor="#005a58"
                knobColor="#005a58"
                progressColorFrom="#00bfbd"
                progressColorTo="#009c9a"
                progressSize={18}
                trackColor="#eeeeee"
                trackSize={18}
                data={minutes} //...
                dataIndex={minutes.indexOf(parsedTime.minutes)}
                //@ts-ignore
                onChange={ value => setParsedTime({...parsedTime, minutes: value}) }
            />
            </HStack>
            </ModalBody>
            <ModalFooter>
                <Button 
                    colorScheme='blue' 
                    mr={3} 
                    onClick={()=>{acceptTime(); setShowTimepicker(false)}}
                >
                    OK
                </Button>
                <Button 
                    variant='ghost'
                    onClick={()=>setShowTimepicker(false)}
                >
                    Cancel
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }

export default ClockWindow