import {  Popover, PopoverTrigger, Button, Portal, PopoverContent, HStack,
          PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody,
          PopoverFooter, Link, Text, Icon, Heading, VStack, Box, Center } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAudio, extend, useDevices, useAlarms, usePopups } from '../../stores'
import { BsFillPlayFill as PlayIcon } from 'react-icons/bs'
import React from 'react'
import { shallow } from 'zustand/shallow'
import { timePadding } from './AlarmComponents/stringifyDate-Time'
import { timeToUnits, timeForNextAlarm, timeToNextAlarm } from './calcAlarmTime'
import { useState, useEffect } from 'react'
import sleep from '../sleep'

const AlarmPop = () =>{
    const plays= useAudio((state)=> state.plays)
    const [alarms, runAlarm, setToDelete, setToEdit, timeForNextLaunch, toggleActivity, resetSnooze ] = useAlarms(state => 
		[ state.alarms, state.runAlarm, state.setToDelete, state.setToEdit, state.timeForNextLaunch, state.toggleActivity, state.resetSnooze ],  shallow)
    const [devices, viewableDevices, currentDevice] = useDevices(state => 
        [ state.devices, state.viewableDevices, state.currentDevice ],  shallow)
    const [ setShowEdit, setShowDelete ] = usePopups((state)=> 
		[state.setShowEditAlarm, state.setShowDeleteAlarm], shallow)
    const [ noSnooze, setNoSnooze ] = useState(true)
    const setShowAddAlarm = usePopups((state) => state.setShowAddAlarm)

    const navigate = useNavigate()

    const footerText = () => {
        let addBtn = (<Button onClick={()=>setShowAddAlarm(true)}  width="100%" >Add Alarm</Button>)
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
                            Edit Alarm
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
    useEffect(()=>{
        if(runAlarm){
            let epochAlarm = timeToNextAlarm(runAlarm)
            let timeToAlarm = timeForNextAlarm(runAlarm).getTime() - Date.now()
            setNoSnooze(Math.abs(epochAlarm-timeToAlarm) < 20)
        }
    },[runAlarm, alarms])
    return(
        <Popover  >
            <PopoverTrigger>
            <Link>
                <Text as="b">
                    Alarms {(plays)?<Icon as={PlayIcon} />:""}
                </Text>
            </Link>
            </PopoverTrigger>
            <Portal>
                <PopoverContent>
                <PopoverArrow />
                <PopoverHeader>
                    <Center>
                        Alarm Info
                    </Center>
                </PopoverHeader>
                {runAlarm && <PopoverBody  backgroundColor={"blue.300"}>
                    {timerInfo()}
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