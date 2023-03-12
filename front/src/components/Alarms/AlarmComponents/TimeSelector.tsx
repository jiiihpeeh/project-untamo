import React, { useRef, useEffect, useCallback } from 'react'
import { TimepickerUI } from 'timepicker-ui'
import { Input, FormLabel, HStack, Box,Center } from "@chakra-ui/react"
import useAlarm from "./alarmStates"

const TimeSelector = () => {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)
    const tmRef = useRef(null)
  
    const testHandler = useCallback((e: CustomEvent) => {
        setTime(`${e.detail.hour}:${e.detail.minutes}`)
    }, [])
  
    useEffect(() => {
      const tm = (tmRef.current as unknown) as HTMLDivElement;
  
      const newPicker = new TimepickerUI(tm, {clockType: "24h" })
      newPicker.create()
  
      //@ts-ignore
      tm.addEventListener('accept', testHandler)
  
      return () => {
        //@ts-ignore
        tm.removeEventListener('accept', testHandler)
      };
    }, [testHandler])
  
    return (
            <Box 
                className='timepicker-ui' 
                ref={tmRef}
                alignContent="center"
            >
                <Center>
                    <FormLabel>
                        Time
                    </FormLabel>
                    <Input
                        type='test'
                        className='timepicker-ui-input'
                        defaultValue={time}
                        fontSize="50px" 
                        width="170px" 
                        height="70px"
                        borderRadius="sm"
                        borderStyle="solid"
                        borderWidth="5px"
                        textShadow='1px 2px gray'
                        textAlign={"center"}
                        value={time}
                    />
                </Center>
            </Box>
    )
}
export default TimeSelector
