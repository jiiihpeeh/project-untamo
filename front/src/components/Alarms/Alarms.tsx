import { Card, CardHeader, CardBody, CardFooter, Stack, StackDivider, Box, VStack, HStack, Divider, Flex, Spacer } from '@chakra-ui/react'
import React, { useState, useRef } from "react"
import {  Container, Heading, Table, Thead, Tbody,Tr, Th,Td, TableCaption,
		  TableContainer, Center,Switch, Tooltip, IconButton, Text } from '@chakra-ui/react'
import { timeForNextAlarm, dayContinuationDays, numberToWeekDay } from "./calcAlarmTime"
import { useLogIn, useDevices, useAlarms, usePopups } from "../../stores"
import { WeekDay } from "../../type"
import { DeleteIcon, EditIcon, CheckIcon } from '@chakra-ui/icons'
import { Alarm, AlarmCases, Device } from "../../type"
import AddAlarmButton from "./AddAlarmButton"
import { timeToNextAlarm } from "./calcAlarmTime"
import { timePadding , stringToDate} from "./AlarmComponents/stringifyDate-Time"
import { shallow } from 'zustand/shallow'
import { Fade, ScaleFade, Slide, SlideFade, Collapse } from '@chakra-ui/react'
import { timeToUnits } from './calcAlarmTime'

const Alarms = () => {
    const userInfo = useLogIn((state)=> state.user)
	const containerRef =useRef<HTMLDivElement>(null)
	const [devices, viewableDevices, currentDevice] = useDevices(state => 
		[ state.devices, state.viewableDevices, state.currentDevice ],  shallow)

	const [alarms, runAlarm, setToDelete, setToEdit, timeForNextLaunch, toggleActivity ] = useAlarms(state => 
		[ state.alarms, state.runAlarm, state.setToDelete, state.setToEdit, state.timeForNextLaunch, state.toggleActivity ],  shallow)

	const [ setShowEdit, setShowDelete ] = usePopups((state)=> 
		[state.setShowEditAlarm, state.setShowDeleteAlarm], shallow)
		
	const [ showTooltip, setShowTooltip] = useState("")
	const [ showButtons, setShowButtons] = useState("")

    function capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }

	const FooterText = () => {
		if( !runAlarm || !currentDevice || !(runAlarm.devices).includes(currentDevice) ||  timeForNextLaunch < 0){
			return "No alarms for this device"
		}
		const units = timeToUnits(timeForNextLaunch)
		if(units.days === 0){
			if(units.hours === 0){
				return `Time left to next alarm: ${timePadding(units.minutes)}:${timePadding(units.seconds)}`
			} 
			return `Time left to next alarm: ${timePadding(units.hours)}:${timePadding(units.minutes)}`
		}
		return `Time left to next alarm:  ${units.days} days ${timePadding(units.hours)}:${timePadding(units.minutes)}`
	}
	
	const renderCards = () => {
		let viewableAlarmsSet = new Set<Alarm> ()		
		let timeAlarmMap = new Map <number, Set<string>>()
		for(const filtrate of viewableDevices){
			for(const secondFiltrate of alarms.filter(alarm => alarm.devices.includes(filtrate))){
				viewableAlarmsSet.add(secondFiltrate)			
				let timeStamp : number| null
                try{
                    timeStamp = timeForNextAlarm(secondFiltrate).getTime()
                }catch(err){
                    timeStamp = null
                }			
                 
				if(timeStamp && secondFiltrate){
					let alarmMapStamp = timeAlarmMap.get(timeStamp)
					if(alarmMapStamp){
						timeAlarmMap.set(timeStamp, alarmMapStamp.add(secondFiltrate.id) )
					}else{
						timeAlarmMap.set(timeStamp, new Set( [ secondFiltrate.id ]))
					}
				}
			}
		}
		let viewableAlarms = [...viewableAlarmsSet]
		
		let timeMapArray = [...timeAlarmMap.keys()].sort(function(a, b){return a - b})
		let sortedView : Array<Alarm> = []
		for(const item of timeMapArray){
			let timeAlarmMapItem = timeAlarmMap.get(item)
			if(timeAlarmMapItem){
				for (const subitem of timeAlarmMapItem){
					let filtration = viewableAlarms.filter(alarm => alarm.id === subitem)[0]
					if(filtration){
						sortedView.push(filtration)
					}
				}
			}
		}


		const timeTooltip = (id: string) =>{
			const timeMs = timeToNextAlarm(alarms.filter( item =>  item.id === id  )[0])
			const time = timeToUnits(Math.round(timeMs/1000))
			setShowTooltip(`${time.days} days ${timePadding(time.hours)}:${timePadding(time.minutes)}:${timePadding(time.seconds)}`)
		} 
        const occurenceInfo = (occurence: AlarmCases, weekdays: Array<WeekDay>, date: string)=> {
            switch(occurence){
                case AlarmCases.Weekly:
                    return(
                        <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Weekdays
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            {weekdayDisplay(weekdays, date)}
                        </Text>
                        </Box>)
                case AlarmCases.Once:
                    return(
                        <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Date
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            {`${date} ${weekdayDisplay(weekdays, date)}`}
                        </Text>
                    </Box>
                    )
                case AlarmCases.Yearly:
                    return(
                        <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Date
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            {`${date} ${weekdayDisplay(weekdays, date)}`}
                        </Text>
                    </Box>
                    )
            }
        }
		return sortedView.map(({ id, occurence, time, weekdays, date, label, devices, active },key) => {
			return (
                    <Card
                        key={key}
                        backgroundColor={(!active)?'gray.100':((key % 2 === 0)?'yellow.100':'cyan.100')}
                        onMouseLeave={()=>{setShowButtons("")}}
                        onMouseEnter={() => { setShowButtons(id); timeTooltip(id)}}
                        mb={"5px"}
						id={`alarmCardContainer-${key}`}
						size={"sm"}
                    >
                        
                        <CardBody>
                            <Tooltip label={showTooltip}>                               
                                <CardHeader >
                                    {`${capitalize(occurence)}: `} {<Text as="b">{label}</Text>}
                                </CardHeader> 
                            </Tooltip>
                            <HStack divider={<StackDivider />}>
                            <Box>
                                
                                <Heading size='xl' textTransform='uppercase'>
                                    {time}
                                </Heading>
                               
                            </Box>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    Devices
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                    {mapDeviceIDsToNames(devices)}
                                </Text>
                            </Box>
                                {occurenceInfo(occurence, weekdays, date)}

                            </HStack>
                            <Collapse in={showButtons === id} animateOpacity>
                                <Flex mt={"10px"}>
                                    <Box>
                                        <Heading size='xs' textTransform='uppercase' mb="4px">
                                            Edit
                                        </Heading>
                                        <IconButton 
                                            size='xs' 
                                            icon={<EditIcon/>}
                                            colorScheme='orange'
                                            aria-label=''
                                            key={`edit-${key}`}
                                            onClick= {() => { setToEdit(id); setShowEdit(true)}}
                                        />
                                    </Box>
                                    <Spacer/>
                                    <Box>

                                        <Heading size='xs' textTransform='uppercase' mb="4px">
                                            Active
                                        </Heading>
                                        <Switch 
                                            name={`alarm-switch-${key}`}
                                            key={`alarm-active-${key}`}
                                            isChecked={active}
                                            size='sm' 
                                            onChange={() => {toggleActivity(id); setShowEdit(false)}}
                                        />					
                                    </Box>
                                    <Spacer />
                                    <Box >
                                        <Heading size='xs' textTransform='uppercase' mb="4px">
                                            Delete
                                        </Heading>
                                        <IconButton 
                                            size='xs' 
                                            icon={<DeleteIcon/>} 
                                            colorScheme='red'
                                            aria-label=''
                                            onClick= {() => { setShowEdit(false); setToDelete(id);  setShowDelete(true)}}
                                            key={`delete-${id}-${key}`}
                                        />
                                    </Box>
                                </Flex>
                            </Collapse>
                        </CardBody>

                    </Card>
		)})
		
    }
	const dateView = (date: string, occurence: AlarmCases) => {
		let datePieces = date.split('-')
		if(occurence === AlarmCases.Yearly){
			return `${datePieces[2]}.${datePieces[1]}`
		}else if (occurence === AlarmCases.Once){
			return `${datePieces[2]}.${datePieces[1]}.${datePieces[0]}`
		}
		return ""
	}
	const mapDeviceIDsToNames = (deviceIDs : Array<string>) =>{
		let filteredDevices = devices.filter(device => deviceIDs.includes(device.id))
		let filteredDeviceNames: Array<string> = [] 
		for(const dev of filteredDevices){
			filteredDeviceNames.push(dev.deviceName)
		}
		return filteredDeviceNames.join(", ")
	}


	const weekdayDisplay = (days: Array<WeekDay>, date:string) => {
		let dayArr = dayContinuationDays(days)
		let subList: Array<string> = []  
		for(const outer of dayArr){
			subList.push(outer.join('-'))
		}
		let daysFormat = subList.join(', ')
		if(daysFormat.length === 0){
			if(date.length > 0){
				daysFormat = numberToWeekDay(stringToDate(date).getDay())
			}
		}
		return daysFormat
	}

	return (
			<>
				<Container id={`alarmCardContainer`} ref={containerRef} >
                    {renderCards()}
				</Container>
				<AddAlarmButton mounting={containerRef.current}/>
			</>
		)
}

export default Alarms