import {  Popover,  Button, Portal, PopoverContent, HStack,
          PopoverHeader, PopoverArrow, PopoverBody, PopoverAnchor, 
          PopoverFooter, Text, VStack, Box, Center } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAudio,  useDevices, useAlarms, usePopups, useLogIn } from '../../stores'
import React from 'react'
import { shallow } from 'zustand/shallow'
import { timePadding } from './AlarmComponents/stringifyDate-Time'
import { timeToUnits, timeForNextAlarm, timeToNextAlarm } from './calcAlarmTime'
import { useState, useEffect } from 'react'

const AlarmPop = () =>{
    const userInfo = useLogIn((state)=> state.user)
    const plays = useAudio((state)=> state.plays)
    const stop = useAudio((state)=> state.stop)

    const [alarms, runAlarm, setToEdit, timeForNextLaunch,  resetSnooze ] = useAlarms(state => 
		[ state.alarms, state.runAlarm, state.setToEdit, state.timeForNextLaunch, state.resetSnooze ],  shallow)
    const currentDevice = useDevices(state =>  state.currentDevice)
    const devices = useDevices(state =>  state.devices)

    const [ showAlarmPop, setShowAlarmPop, setShowEdit, navigationTriggered] = usePopups((state)=> 
		[ state.showAlarmPop, state.setShowAlarmPop, state.setShowEditAlarm, state.navigationTriggered], shallow)
    const [ noSnooze, setNoSnooze ] = useState(true)
    const setShowAddAlarm = usePopups((state) => state.setShowAddAlarm)
    const [ posStyle, setPosStyle ] = useState<React.CSSProperties>({})

    const navigate = useNavigate()

    const footerText = () => {
        let addBtn = (<Button onClick={()=>setShowAddAlarm(true)}  width="100%" >Add an Alarm</Button>)
		if( !runAlarm || !currentDevice || !(runAlarm.devices).includes(currentDevice) ||  timeForNextLaunch < 0){
			return (<Box> <Text alignContent={"center"}>No alarms for this device</Text> {addBtn} </Box>) 
		}
        
		const units = timeToUnits(timeForNextLaunch)
		if(units.days === 0){
			if(units.hours === 0){
				return (<Box><Text alignContent={"center"}>Time left to next alarm: {timePadding(units.minutes)}:{timePadding(units.seconds)}</Text> {addBtn} </Box>)
			} 
			return (<Box><Text alignContent={"center"}>Time left to next alarm: {timePadding(units.hours)}:{timePadding(units.minutes)}  </Text>{addBtn}</Box>)
		}
		return (<Box> <Text alignContent={"center"}>Time left to next alarm:  {units.days} days {timePadding(units.hours)}:{timePadding(units.minutes)} </Text> {addBtn} </Box>)
	}


    const timerInfo = () =>{
        return (
                <VStack>
                    <Text as="b">
                        Coming Up: {(runAlarm)?`${runAlarm.time}`:""}
                    </Text>
                    <HStack>
                        <Button 
                            onClick={()=> {(runAlarm)?setToEdit(runAlarm.id):{}; (runAlarm)?setShowEdit(true):{}}}
                        >
                            Edit the Alarm
                        </Button> 
                        {(!noSnooze) && <Button 
                            onClick={resetSnooze}
                        >
                            Reset Snooze
                        </Button>}
                    </HStack>
                </VStack>

        )
    }
    const turnOff = () => {
        if(plays){
            return(
                <Center>
                    <Button 
                        onClick={stop} 
                        m={"3px"}
                    >
                        Turn off Sound
                    </Button> 
                </Center>           
            )
        }else{
            return(<></>)
        }
    }

    useEffect(()=>{
        if(runAlarm){
            let epochAlarm = timeToNextAlarm(runAlarm)
            let timeToAlarm = timeForNextAlarm(runAlarm).getTime() - Date.now()
            setNoSnooze(Math.abs(epochAlarm-timeToAlarm) < 20)
        }
    },[runAlarm, alarms])
    useEffect(()=>{
        let elem = document.getElementById("link-alarm")
        if(elem){
            let coords = elem.getBoundingClientRect()
            setPosStyle({left: coords.left + coords.width/2, top:coords.top - coords.height +10, position:"absolute"})
        }
    },[navigationTriggered])

    const getCurrentDevice = () =>{
        if(currentDevice){
            let device = devices.filter(d =>d.id === currentDevice)[0]
            return (device)?device.deviceName:""
        }
        return ""
    }
    return(
            <Popover
                isOpen={showAlarmPop}
                onClose={()=>setShowAlarmPop(false)}
            >
            <PopoverAnchor>
                <Box style={posStyle} />
            </PopoverAnchor>
                <Portal>
                    <PopoverContent>
                    <PopoverArrow />
                    <PopoverHeader>
                        <Center>
                        Alarms for {userInfo.screenName} on {getCurrentDevice()}
                        </Center>
                    </PopoverHeader>
                    {runAlarm && <PopoverBody  backgroundColor={"blue.300"}>
                        {timerInfo()}
                        {turnOff()}
                    </PopoverBody>}
                    <PopoverFooter  backgroundColor={"gray.300"}>
                        {footerText()}
                    </PopoverFooter>
                    </PopoverContent>
                </Portal>
            </Popover>        
    )
}

export default AlarmPop