import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text, Image, IconButton, Switch,
         Stack, Spacer, Heading, FormLabel } from "@chakra-ui/react"
import {  useAlarms, useTimeouts, useAudio, extend, usePopups, useTask, useSettings } from '../../stores'
import { CloseTask, Path } from '../../type'
import sleep from '../sleep'
import { urlEnds } from '../../utils'
import '../../App.css'
import { LaunchMode } from '../../stores/taskStore'

const PlayAlarm = () =>{
    const windowSize = usePopups((state)=>state.windowSize)
    const [ clockSize, setClockSize ] = useState(Math.min(windowSize.width, windowSize.height) * 0.35)
    const runAlarm =  useAlarms((state)=> state.runAlarm)
    const alarmClock = useAlarms((state)=> state.logo)
    const runOtherSnooze = useAlarms((state)=> state.runOtherSnooze)
    const setRunOtherSnooze = useAlarms((state)=> state.setRunOtherSnooze)
    const resetSnooze = useAlarms((state)=> state.resetSnooze)
    const snoozeAlarm = useAlarms((state)=> state.snoozer)
    const clearTimeouts = useTimeouts((state)=>state.clearIdTimeout)
    const playAudio = useAudio((state) => state.play)
    const setTrack = useAudio((state)=>state.setTrack)
    const stopAudio = useAudio((state)=>state.stop)
    const setLoop = useAudio((state)=>state.setLoop)
    const clearRunTimeout = useTimeouts((state)=>state.clearRunAlarmID)
    const snoozeIt = useTimeouts((state)=>state.snoozeIt)
    const setSnoozeIt = useTimeouts((state)=>state.setSnoozeIt)
    const launchMode = useTask((state)=>state.launchMode)
    const setLaunchMode = useTask((state)=>state.setLaunchMode)
    const setShowTask = usePopups((state)=>state.setShowTask)
    const snoozePressTime = useSettings((state)=>state.snoozePress)
    const closeTask = useSettings((state)=>state.closeTask)

    const [ pressTime, setPressTime ] = useState(0)
    
    useEffect(() => {
        setClockSize(Math.min(windowSize.width, windowSize.height) * 0.35)
    }, [windowSize])

    const navigate = useNavigate()
    
    const removeAlarmObject = () => {
        try{
            //clearRunTimeout()
            clearTimeouts()
        }catch(err){}
    }
    
    const turnOff = async () => {
        if((closeTask === CloseTask.Obey && runAlarm && runAlarm.closeTask) || (closeTask === CloseTask.Force)){
            setShowTask(true)
        }else{
            console.log("turn OFF")
            resetSnooze()
            removeAlarmObject()
            setTimeout(() => {navigate(extend(Path.Alarms));stopAudio()},100)   
        }
    }
    useEffect(() => {
        if(launchMode === LaunchMode.Snooze){
            setLaunchMode(LaunchMode.None)
            setSnoozeIt(true)
        }else if(launchMode === LaunchMode.TurnOff){
            setLaunchMode(LaunchMode.None)
            resetSnooze()
            removeAlarmObject()
            setTimeout(() => {navigate(extend(Path.Alarms));stopAudio()},100)
        }
        console.log(launchMode)
    },[launchMode])

    useEffect(() => {
        if(runOtherSnooze){
            navigate(extend(Path.Alarms))
            removeAlarmObject()
            setRunOtherSnooze(false)
        }
    }, [runOtherSnooze])

    useEffect(() => {
        async function playIt(){
            setLaunchMode(LaunchMode.None)
            if(runAlarm){
                setTrack(runAlarm.tone)
                setLoop(true)
                let step = 0
                while(!urlEnds(Path.PlayAlarm) || step > 300){
                    await sleep(10)
                    step++
                }
                playAudio()
            }else{
                clearRunTimeout()
            }
        }
        playIt()
    },[runAlarm])

    useEffect(()=>{
        if(snoozeIt){
            snoozeAlarm()
            removeAlarmObject()
            setTimeout(() => {navigate(extend(Path.Alarms)); stopAudio()},100)
            setSnoozeIt(false)
        }
    },[snoozeIt])

    const snoozePressFunction = (time: number) =>{
        if((pressTime > 0) && (time - pressTime > snoozePressTime)){
            setSnoozeIt(true)
            setPressTime(0)
        }
    }
    const userPressStart = (e:any)=>{
        e.preventDefault()
        setPressTime(Date.now())
    }
    const userPressStop = (e:any)=>{
        e.preventDefault()
        snoozePressFunction(Date.now())
    }
    return(
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
                //onClick={(e)=>setSnoozeIt(true)}
                aria-label=""
                value=""
                id="Snooze-Button"
                onMouseDown={userPressStart}
                onMouseUp={userPressStop}
                onTouchStart={userPressStart}
                onTouchEnd={userPressStop}
            >
                <Image 
                    src={alarmClock}  
                    width='60%'
                    draggable="false"
                    pointerEvents={"none"}
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
     )
}
export default PlayAlarm