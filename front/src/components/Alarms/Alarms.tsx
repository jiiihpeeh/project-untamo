import { Card, CardHeader, CardBody, StackDivider, Box, HStack, Flex, Spacer,Text, VStack } from '@chakra-ui/react'
import React, { useState, useRef, useCallback, useEffect } from "react"
import {  Container, Heading, Switch, Tooltip, IconButton } from '@chakra-ui/react'
import { timeForNextAlarm, dayContinuationDays, numberToWeekDay } from "./calcAlarmTime"
import { useLogIn, useDevices, useAlarms, usePopups, useSettings, extend } from "../../stores"
import { Path, WeekDay } from "../../type"
import { DeleteIcon, EditIcon, CheckIcon } from '@chakra-ui/icons'
import { Alarm, AlarmCases, Device } from "../../type"
import AddAlarmButton from "./AddAlarmButton"
import { timeToNextAlarm } from "./calcAlarmTime"
import { stringToDate} from "./AlarmComponents/stringifyDate-Time"
import { timePadding, time24hToTime12h, capitalize } from '../../utils'
import { shallow } from 'zustand/shallow'
import { Fade, ScaleFade, Slide, SlideFade, Collapse } from '@chakra-ui/react'
import { timeToUnits } from './calcAlarmTime'
import { useNavigate } from "react-router-dom"
import sleep from '../sleep'

const Alarms = () => {
    const containerRef =useRef<HTMLDivElement>(null)
	const currentDevice = useDevices((state) => state.currentDevice)
    const cardColors = useSettings((state)=> state.cardColors)
    const clock24 = useSettings((state)=> state.clock24)
    const [devices, viewableDevices] = useDevices(state => 
          [ state.devices, state.viewableDevices ],  shallow)
    const [alarms, setToDelete, setToEdit, toggleActivity ] = useAlarms(state => 
          [ state.alarms, state.setToDelete, state.setToEdit,  state.toggleActivity ],  shallow)
    const [ setShowEdit, setShowDelete ] = usePopups((state)=> 
          [state.setShowEditAlarm, state.setShowDeleteAlarm], shallow)
    const [ showTiming, setShowTiming] = useState("")
    const [ showButtons, setShowButtons] = useState("")
	const   timeIntervalID = useRef<string | null>(null) 
	const counterLauncher = useRef<boolean>(false) 
	const navigate = useNavigate()

	const timeCounter = async() =>{
		if(timeIntervalID.current){
				const timeMs = timeToNextAlarm(useAlarms.getState().alarms.filter( item =>  item.id === timeIntervalID.current  )[0])
				const time = timeToUnits(Math.round(timeMs/1000))
				setShowTiming(` (${time.days} days ${timePadding(time.hours)}:${timePadding(time.minutes)}:${timePadding(time.seconds)})`)
			}
		setTimeout(()=>timeCounter(),330)	
	}
	useEffect(() => {
		if(!counterLauncher.current){
			timeCounter()
			counterLauncher.current = true
		}
	},[])
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

        const occurenceInfo = (occurence: AlarmCases, weekdays: Array<WeekDay>, date: string)=> {
            switch(occurence){
                case AlarmCases.Weekly:
                    return(
                        <Box>
                        <Heading 
                            size='xs' 
                            textTransform='uppercase'
                        >
                            Weekdays
                        </Heading>
                        <Text 
                            pt='2' 
                            fontSize='sm'
                        >
                            {weekdayDisplay(weekdays, date)}
                        </Text>
                        </Box>)
                case AlarmCases.Once:
                    return(
                        <Box>
                        <Heading 
                            size='xs' 
                            textTransform='uppercase'
                        >
                            Date
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            {`${date} ${weekdayDisplay(weekdays, date)}`}
                        </Text>
                    </Box>
                    )
                case AlarmCases.Daily:
                    return(
                        <Box>
                            <Heading 
                                size='xs' 
                                textTransform='uppercase'
                            >
                                Weekdays
                            </Heading>
                            <Text 
                                pt='2' 
                                fontSize='sm'
                            >
                                {weekdayDisplay(Object.values(WeekDay).filter((item) => item), date)}
                            </Text>
                        </Box>
                )
                case AlarmCases.Yearly:
                    return(
                        <Box>
                        <Heading 
                            size='xs' 
                            textTransform='uppercase'
                        >
                            Date
                        </Heading>
                        <Text 
                            pt='2' 
                            fontSize='sm'
                        >
                            {`${date} ${weekdayDisplay(weekdays, date)}`}
                        </Text>
                    </Box>
                    )
            }
        }
        const getTime = (time: string)=>{
            if(!clock24){
                let fmt = time24hToTime12h(time)
                return (<HStack><Text>{fmt.time}  <Text fontSize='sm'>{fmt['12h']}</Text></Text></HStack>)
            }
            return (<Text>{time}</Text>)
        }
        return sortedView.map(({ id, occurence, time, weekdays, date, label, devices, active },key) => {
            return (
                    <Card
                        key={key}
                        backgroundColor={(!active)?cardColors.inactive:((key % 2 === 0)?cardColors.odd:cardColors.even)}
                        onMouseLeave={()=>{setShowButtons(""); timeIntervalID.current = null } }
                        onMouseEnter={() => { setShowButtons(id); timeIntervalID.current = id}}
                        mb={"5px"}
                        id={`alarmCardContainer-${key}`}
                        size={"sm"}
                    >                        
                        <CardBody>           
                            <CardHeader >
								{(showButtons !== id)? 
									<Text>{capitalize(occurence)}: <Text as="b">{label}</Text></Text>:
                                <SlideFade in={showButtons === id} > 
									{`${capitalize(occurence)}: `} <Text as="b">{label}</Text>  {showTiming}
								</SlideFade>}
                            </CardHeader> 
                            <HStack 
                               divider={<StackDivider />}
                            >
                            <Box>
                                <Heading 
                                    size='xl' 
                                    textTransform='uppercase'
                                >
                                    {getTime(time)}
                                </Heading>
                            </Box>
                            <Box>
                                <Heading 
                                    size='xs' 
                                    textTransform='uppercase'
                                >
                                    Devices
                                </Heading>
                                <Text 
                                    pt='2' 
                                    fontSize='sm'
                                >
                                    {mapDeviceIDsToNames(devices)}
                                </Text>
                            </Box>
                                {occurenceInfo(occurence, weekdays, date)}

                            </HStack>
                            <Collapse 
                                in={showButtons === id} 
                                animateOpacity={true}  
                            >
                                <Flex 
                                    mt={"10px"}
                                >
                                    <Box>
                                        <Heading 
                                            size='xs' 
                                            textTransform='uppercase' 
                                            mb="4px"
                                        >
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
                                        <Heading 
                                            size='xs' 
                                            textTransform='uppercase' 
                                            mb="4px"
                                        >
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
                                        <Heading 
                                            size='xs' 
                                            textTransform='uppercase' 
                                            mb="4px"
                                        >
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
                )
            }
        )
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
	useEffect(() => {
		if(!currentDevice){
			navigate(extend(Path.Welcome))
		}
	},[currentDevice])
    return (
            <>
                <Container 
                    id={`alarmCardContainer`} 
                    ref={containerRef}
                >
                    {renderCards()}
                </Container>
                <AddAlarmButton 
                    mounting={containerRef}
                />
            </>
        )
}

export default Alarms