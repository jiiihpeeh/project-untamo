import React, { useRef, useEffect, useCallback, useState } from 'react'
import { TimepickerUI } from 'timepicker-ui'
import { Input, FormLabel, Box,Center } from "@chakra-ui/react"
import useAlarm, { Direction } from "./alarmStates"

const TimeSelector = () => {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)
    const changeTime = useAlarm((state)=> state.changeTime)
    const tmRef = useRef(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const inputTime = useRef<number>(Date.now())
    const wheelTimes = useRef<Array<number>>([])
  
    const acceptTime = useCallback((e: CustomEvent) => {
        setTime(`${e.detail.hour}:${e.detail.minutes}`)
    }, [])
  
    useEffect(() => {
      const tm = (tmRef.current as unknown) as HTMLDivElement
      //console.log(tm) 
      const newPicker = new TimepickerUI(tm, { clockType: "24h" })
      newPicker.create()
  
      //@ts-ignore
      tm.addEventListener('accept', acceptTime)
  
      return () => {
        //@ts-ignore
        tm.removeEventListener('accept', acceptTime)
      };
    }, [acceptTime])

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
                        fontSize="50px" 
                        width="170px" 
                        height="70px"
                        borderRadius="md"
                        borderStyle="solid"
                        borderWidth="5px"
                        textShadow='1px 2px gray'
                        textAlign={"center"}
                        value={time}
                        ref={inputRef}
                        onWheel={e =>{ChangeTimeWheel(e.deltaY, e.pageX)}}
                        onKeyDown={e=>console.log(e)}
                        readOnly
                    />
                </Center>
            </Box>
    )
}
export default TimeSelector
