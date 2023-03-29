import React, { useRef, useEffect, useState } from 'react'
import { Input, FormLabel, Box,Center, Button, Text } from "@chakra-ui/react"
import useAlarm, { Direction } from "./alarmStates"
import ClockWindow from './ClockWindow'
import { usePopups, useSettings } from '../../../stores'
import { time24hToTime12h } from '../../../utils'

const TimeSelector = () => {
    const time = useAlarm((state)=> state.time)
    const clock24 = useSettings((state)=> state.clock24)

    const [ clockTime, setClockTime ] = useState(time)
    const [ amPm, setAmPm ] = useState(" AM")
    const setTime = useAlarm((state)=> state.setTime)
    const changeTime = useAlarm((state)=> state.changeTime)
    const setShowTimepicker = usePopups((state)=> state.setShowTimepicker)

    const tmRef = useRef(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const inputTime = useRef<number>(Date.now())
    const wheelTimes = useRef<Array<number>>([])
  

    const ChangeTimeWheel = (message: number, position: number) => {
        const now = Date.now()
        if(now - inputTime.current  < 20){
            return
        }
        inputTime.current = now
        let timesFiltered: Array<number> = []

        for(const i of wheelTimes.current){
            if( now - i < 150 ){
                timesFiltered.push(i)
            }
        }
        wheelTimes.current = [...timesFiltered, now]
        
        let multiplier = 1
        if(timesFiltered.length > 4){
            multiplier = 4 * multiplier
        }else if(timesFiltered.length > 3){
            multiplier = 3 * multiplier
        }
        const width = (inputRef.current)? inputRef.current.offsetWidth : 0
        const leftOffset = (inputRef.current)? inputRef.current.offsetLeft : 0
        const cutOff = Math.round(width/2) + leftOffset
        if(position < cutOff){
            multiplier = 60 * multiplier
        }

        if(message >0){
            changeTime(Direction.Decrease, multiplier)
        }else{
            changeTime(Direction.Increase, multiplier)
        }
    }
    useEffect(()=>{
        if(clock24){
            setClockTime(time)
        }else{
            const time12 = time24hToTime12h(time)
            setAmPm(time12['12h'])
            setClockTime(time12.time)
        }
    },[time])
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
                        type='text'
                        fontSize="50px" 
                        width="170px" 
                        height="70px"
                        borderRadius="md"
                        borderStyle="solid"
                        borderWidth="5px"
                        textShadow='1px 2px gray'
                        textAlign={"center"}
                        value={clockTime}
                        ref={inputRef}
                        onWheel={e =>{ChangeTimeWheel(e.deltaY, e.pageX)}}
                        onClick={()=>setShowTimepicker(true)}
                        readOnly
                    />
                    {!clock24 && <Text as ="b" m={"3px"} textShadow={'1px 1px gray'}>
                        {amPm}
                    </Text>}
                    <ClockWindow/>
                </Center>
            </Box>
    )
}
export default TimeSelector
