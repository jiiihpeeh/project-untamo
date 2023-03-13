     

import {
    Modal,ModalOverlay, Heading,
    ModalContent, ModalHeader,
    ModalFooter, ModalBody, HStack, VStack, Text,
    ModalCloseButton, Button, Box
  } from '@chakra-ui/react'
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

    const [parsedTime, setParsedTime] = useState({hours: 0, minutes: 0})


    // const numberStrArray = (n:number) => {
    //     let arr : Array<string> = []
    //     for(let i = 0; i<n; i++){
    //         arr.push(`${i}`)
    //     }
    //     return arr
    // }
    // let hours = numberStrArray(24)
    // let minutes = numberStrArray(60)

    const acceptTime = () => {
        setTime(`${timePadding(Math.floor(parsedTime.hours))}:${timePadding(Math.floor(parsedTime.minutes))}`)
    }    
    useEffect(()=>{
        let timeArr = time.split(":")
        setParsedTime({hours: Math.round(parseInt(timeArr[0])), minutes: Math.round(parseInt(timeArr[1]))})
    }, [time, showTimepicker])

    useEffect(()=>{
        console.log(`${timePadding(Math.floor(parsedTime.hours))}:${timePadding(Math.floor(parsedTime.minutes))}`)
    }, [parsedTime])
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
                        <Heading
                            as="b"
                            size={"xl"}
                            background="gray.300"
                        >
                             {timePadding(Math.floor(parsedTime.hours))}
                        </Heading>
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
                    </VStack>
                    <Heading
                        as="b"
                        size={"xl"}
                        background="gray.300"
                    >
                        {` :  `}
                    </Heading>
                    <VStack>
                        <Heading 
                            as="b"
                            size={"xl"}
                            background="gray.300"
                            scale={2}
                        >
                            {timePadding(Math.floor(parsedTime.minutes))}
                        </Heading>
                        <Box
                            id="CircularSliderMinutes"
                            ref={minuteSlider}
                        >
                            <CircularSlider
                                handle1={{
                                    value: parsedTime.minutes*5/3,
                                    onChange: v => setParsedTime({...parsedTime, minutes: 2.99*v/5})
                                }}
                                arcColor="#690"
                                coerceToInt={false}
                                //outerShadow={true}
                            />
                        </Box>                        
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


                    // {/* <CircularSlider
                    //     width={190}
                    //     label="hours"
                    //     labelColor="#005a58"
                    //     knobColor="#005a58"
                    //     progressColorFrom="#00bfbd"
                    //     progressColorTo="#009c9a"
                    //     progressSize={20}
                    //     trackColor="#eeeeee"
                    //     trackSize={20}
                    //     data={hours} 
                    //     dataIndex={hours.indexOf(parsedTime.hours)}
                    //     onChange={(value: string)=>setParsedTime({...parsedTime, hours: value})}
                    // />
                    // <CircularSlider
                    //     width={190}
                    //     label="minutes"
                    //     labelColor="#005a58"
                    //     knobColor="#005a58"
                    //     progressColorFrom="#00bfbd"
                    //     progressColorTo="#009c9a"
                    //     progressSize={18}
                    //     trackColor="#eeeeee"
                    //     trackSize={18}
                    //     data={minutes} //...
                    //     dataIndex={minutes.indexOf(parsedTime.minutes)}
                    //     onChange={(value: string)=>setParsedTime({...parsedTime, minutes: value})}
                    // // />