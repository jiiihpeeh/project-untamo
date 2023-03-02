import React, { useLayoutEffect, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, Image, IconButton, Switch,
         Stack, Spacer, Heading, FormLabel } from "@chakra-ui/react"
import {  useAlarms, useTimeouts, useAudio } from '../../stores'
import alarmclock from './logo.svg'
import '../../App.css'

const PlayAlarm = () =>{
    const [ clockSize, setClockSize ] = useState(Math.min(window.innerWidth, window.innerHeight) * 0.35)
    const runAlarm =  useAlarms((state)=> state.runAlarm)
    const runOtherSnooze = useAlarms((state)=> state.runOtherSnooze)
    const setRunOtherSnooze = useAlarms((state)=> state.setRunOtherSnooze)
    const resetSnooze = useAlarms((state)=> state.resetSnooze)
    const snoozeAlarm = useAlarms((state)=> state.snoozer)
    const clearTimeouts = useTimeouts((state)=>state.clearIdTimeout)
    const playAudio = useAudio((state) => state.play)
    const setTrack = useAudio((state)=>state.setTrack)
    const stopAudio = useAudio((state)=>state.stop)
    const setLoop = useAudio((state)=>state.setLoop)
    const setRunTimeout = useTimeouts((state)=>state.setRunAlarmID)
    const clearRunTimeout = useTimeouts((state)=>state.clearRunAlarmID)
    
    useLayoutEffect(() => {
        function updateSize() {
            setClockSize(Math.min(window.innerWidth, window.innerHeight) * 0.35)
        }
        window.addEventListener('resize', updateSize)
        updateSize()
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    const navigate = useNavigate()
    
    const removeAlarmObject = () => {
        try{
            clearRunTimeout()
            clearTimeouts()
        }catch(err){}
    }

    const snoozer = async () =>{
        stopAudio()
        snoozeAlarm()
        removeAlarmObject()
        navigate('/alarms') 
    }
    
    const turnOff = async () => {
        stopAudio()
        resetSnooze()
        removeAlarmObject()
        setTimeout(() => {navigate('/alarms')},100)   
    }

    useEffect(() => {
        if(runOtherSnooze){
            navigate('/alarms')
            removeAlarmObject()
            setRunOtherSnooze(false)
        }
    }, [runOtherSnooze])

    useEffect(() => {
        if(runAlarm){
            setTrack(runAlarm.tone)
            setLoop(true)
            playAudio()
            setRunTimeout(setTimeout(snoozer, 5*60*1000))
        }else{
            //clearRunTimeout()
        }
        
    },[runAlarm])

    return(
        <>
        <Stack align='center'>
            <Heading 
                as="h1" 
                size='4xl' 
                color='tomato'  
                textShadow='2px 4px #ff0000' 
                className='AlarmMessage'
            >
                {runAlarm?runAlarm.label:''}    <Text 
                                                    fontSize='sm' 
                                                    textShadow='1px 1px #ff0000' 
                                                >
                                                    ({runAlarm?runAlarm.time:''}) 
                                                </Text>
            </Heading>
            <Heading 
                as='h3' 
                size='md'
            >
                Snooze the Alarm by clicking the clock below
            </Heading>

            <IconButton  
                width={clockSize} 
                height={clockSize} 
                borderRadius="50%" 
                className="AlarmClock"
                bgGradient="radial-gradient(circle, rgba(145,201,179,1) 0%, rgba(9,9,121,1) 0%, rgba(108,27,160,0.7945378835127801) 0%, rgba(136,32,171,1) 30%, rgba(16,23,135,1) 73%, rgba(50,96,210,1) 99%, rgba(148,182,155,1) 100%, rgba(51,175,32,0.5312325613839286) 100%)"
                onClick={snoozer}
                aria-label=""
            >
                <Image 
                    src={alarmclock}  
                    width='60%'
                />
            </IconButton>
            <Spacer />
            <FormLabel 
                mb='0'
            >
                    <Text 
                        as='b'
                    >
                        Turn alarm OFF
                    </Text>
            </FormLabel>
            <Switch 
                size='lg' 
                onChange={(e)=>turnOff()}
            />
        </Stack>
        </> 
    )
}
export default PlayAlarm
