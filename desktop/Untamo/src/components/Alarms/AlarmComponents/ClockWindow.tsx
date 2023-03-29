     

import {  Table, Tbody, Tr, Td, Modal,ModalOverlay, Heading,
          ModalContent, ModalHeader, Center, Text,
          ModalFooter, ModalBody, VStack,
          ModalCloseButton, Button, IconButton } from '@chakra-ui/react'
//import CircularSlider from '@fseehawer/react-circular-slider'
import CircularSlider from "react-circular-slider-svg";
import { timePadding } from '../../../utils'
import useAlarm from './alarmStates'
import React, { useEffect, useState, useRef } from 'react'
import { usePopups } from '../../../stores'
import sleep from '../../sleep';
import { ChevronDownIcon as Down,ChevronUpIcon as Up } from '@chakra-ui/icons'
import { useSettings } from '../../../stores'
import { h24ToH12 } from '../../../utils'

function ClockWindow() {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)
    const showTimepicker = usePopups((state)=> state.showTimepicker)
    const setShowTimepicker = usePopups((state)=> state.setShowTimepicker)
    const clock24 = useSettings((state)=> state.clock24)
    const [ parsedTime, setParsedTime ] = useState({hours: 0, minutes: 0})

    const acceptTime = () => {
        setTime(`${timePadding(Math.floor(parsedTime.hours))}:${timePadding(Math.floor(parsedTime.minutes))}`)
    }    
    useEffect(()=>{
        const setParsed = async () => {
            let timeArr = time.split(":")
            setParsedTime(parsedTime => {
                                            return {
                                                        hours: Math.round(parseInt(timeArr[0])), 
                                                        minutes: Math.round(parseInt(timeArr[1]))
                                                    }
                                        }
                            ) 
        }
        if(showTimepicker){
            setParsed()
        }
    }, [time, showTimepicker])

    return (
        <Modal 
            isOpen={showTimepicker} 
            onClose={()=>setShowTimepicker(false)}
            id="ClockWindow"
            isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
                Set Time
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Table size="sm">
                    <Tbody>
                       <Tr>
                            <Td>
                                <Center>
                                    <CircularSlider
                                        handle1={{
                                            value: parsedTime.hours*25/6,
                                            onChange: v => setParsedTime({...parsedTime, hours: 5.999*v/25})
                                        }}
                                        arcColor="#690"
                                        coerceToInt={false}
                                        size={125}
                                    />
                                </Center>
                            </Td>
                            <Td></Td>
                            <Td>
                                <Center>
                                    <CircularSlider
                                        handle1={{
                                            value: parsedTime.minutes*5/3,
                                            onChange: v => setParsedTime({...parsedTime, minutes: 2.99*v/5})
                                        }}
                                        coerceToInt={false}
                                        arcBackgroundColor="gray"
                                        arcColor="blue"
                                        size={125}
                                    />
                                </Center>
                            </Td>
                        </Tr>
                        <Tr>
                            <Td>
                                <Center>
                                    <Heading
                                        as="b"
                                        size={"2xl"}
                                        //style={hourStyle}
                                    >
                                        {clock24?timePadding(Math.floor(parsedTime.hours)):timePadding(h24ToH12(Math.floor(parsedTime.hours)))}
                                    </Heading>
                                    <VStack ml={"2%"}>
                                    <IconButton 
                                        icon={<Up/>}
                                        aria-label=""
                                        size={"sm"}
                                        rounded={"md"}
                                        onClick={()=>setParsedTime({...parsedTime, hours: (parsedTime.hours + 1 ) % 24 })}
                                    />
                                    <IconButton 
                                        icon={<Down/>}
                                        aria-label=""
                                        size={"sm"}
                                        rounded={"md"}
                                        onClick={()=>setParsedTime({...parsedTime, hours: (parsedTime.hours === 0 )?23:Math.abs((parsedTime.hours - 1 ) % 24)  })}
                                    />
                                    </VStack>
                                </Center>
                            </Td>
                            <Td>
                                <Center>
                                    <Heading
                                        as="b"
                                        size={"2xl"}
                                        //style={hourStyle}
                                    >
                                    :
                                    </Heading>
                                </Center>
                            </Td>
                            <Td>
                                <Center>
                                    <Heading 
                                        as="b"
                                        size={"2xl"}
                                        //style={minuteStyle}
                                    >   
                                        {timePadding(Math.floor(parsedTime.minutes))}
                                    </Heading>
                                    <VStack ml={"2%"}>
                                    <IconButton 
                                        icon={<Up/>}
                                        aria-label=""
                                        size={"sm"}
                                        rounded={"md"}
                                        onClick={()=>setParsedTime({...parsedTime, minutes: (parsedTime.minutes + 1) % 60})}
                                    />
                                    <IconButton 
                                        icon={<Down/>}
                                        aria-label=""
                                        size={"sm"}
                                        rounded={"md"}
                                        onClick={()=>setParsedTime({...parsedTime, minutes: (parsedTime.minutes === 0)?59:Math.max(0,parsedTime.minutes - 1)})}
                                    />
                                    </VStack>
                                    {!clock24 && <Text as="b">
                                        {(Math.floor(parsedTime.hours) >= 12)?"  PM":"  AM"}
                                    </Text>}
                                </Center>  
                            </Td>

                        </Tr>
                    </Tbody>
                </Table>
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
    )
  }

export default ClockWindow