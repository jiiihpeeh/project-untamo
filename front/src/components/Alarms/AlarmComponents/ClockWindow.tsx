     

import {  Modal,ModalOverlay, Heading,
          ModalContent, ModalHeader,
          ModalFooter, ModalBody, HStack, VStack,
          ModalCloseButton, Button, Box } from '@chakra-ui/react'
//import CircularSlider from '@fseehawer/react-circular-slider'
import CircularSlider from "react-circular-slider-svg";
import { timePadding } from './stringifyDate-Time'
import useAlarm from './alarmStates'
import React, { useEffect, useState, useRef } from 'react'
import { usePopups } from '../../../stores'

function ClockWindow() {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)
    const showTimepicker = usePopups((state)=> state.showTimepicker)
    const setShowTimepicker = usePopups((state)=> state.setShowTimepicker)
    const minuteSlider = useRef<HTMLDivElement>(null)
    const hourSlider = useRef<HTMLDivElement>(null)
    const separator = useRef<HTMLDivElement>(null)
    const [ parsedTime, setParsedTime ] = useState({hours: 0, minutes: 0})
    const [ hourStyle, setHourStyle ] = useState<React.CSSProperties>({})
    const [ minuteStyle, setMinuteStyle ] = useState<React.CSSProperties>({})


    const acceptTime = () => {
        setTime(`${timePadding(Math.floor(parsedTime.hours))}:${timePadding(Math.floor(parsedTime.minutes))}`)
    }    
    useEffect(()=>{
        let timeArr = time.split(":")
        setParsedTime({hours: Math.round(parseInt(timeArr[0])), minutes: Math.round(parseInt(timeArr[1]))})  
    }, [time, showTimepicker])

    useEffect(()=>{
        if(separator.current){
            let separatorRect = separator.current?.getBoundingClientRect()
            setHourStyle({position:"absolute", bottom:separatorRect.bottom -100 + window.scrollY})
            setMinuteStyle({position:"absolute",bottom:separatorRect.bottom -100 + window.scrollY })
        }
    },[parsedTime])

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
                <HStack
                    width={400}
                >
                    <VStack>
                        <Box
                            id="CircularSliderHour"
                            ref={hourSlider}
                        >
                            <CircularSlider
                                handle1={{
                                    value: parsedTime.hours*25/6,
                                    onChange: v => setParsedTime({...parsedTime, hours: 5.999*v/25})
                                }}
                                arcColor="#690"
                                coerceToInt={false}
                            />
                        </Box>
                        <Heading
                            as="b"
                            size={"2xl"}
                            style={hourStyle}
                        >
                            {timePadding(Math.floor(parsedTime.hours))}
                        </Heading>
                    </VStack>
                    <Heading
                        as="b"
                        size={"2xl"}
                        ref={separator}
                        id="TimeSeparator"
                    >
                        {` :  `}
                    </Heading>
                    <VStack>
                        <Box
                            id="CircularSliderMinutes"
                            ref={minuteSlider}
                        >
                            <CircularSlider
                                handle1={{
                                    value: parsedTime.minutes*5/3,
                                    onChange: v => setParsedTime({...parsedTime, minutes: 2.99*v/5})
                                }}
                                coerceToInt={false}
                                arcBackgroundColor="gray"
                                arcColor="blue"
                            />
                        </Box>
                        <Heading 
                            as="b"
                            size={"2xl"}
                            style={minuteStyle}
                        >
                            {timePadding(Math.floor(parsedTime.minutes))}
                        </Heading>                     
                    </VStack>

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