import React, { useState } from "react"
import {  Container, Heading, Table, Thead, Tbody,Tr, Th,Td, TableCaption,
		  TableContainer, Center,Switch, Tooltip, IconButton, Text } from '@chakra-ui/react'
import { timeForNextAlarm, dayContinuationDays, numberToWeekDay } from "./calcAlarmTime"
import { useLogIn, useDevices, useAlarms, usePopups } from "../../stores"
import { WeekDay } from "../../type.d"
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Alarm, AlarmCases, Device } from "../../vite-env.d"
import AddAlarmButton from "./AddAlarmButton"
import { timeToNextAlarm } from "./calcAlarmTime"
import { timePadding , stringToDate} from "./AlarmComponents/stringifyDate-Time"
import { CheckIcon } from "@chakra-ui/icons"


const Alarms = () => {
    const userInfo = useLogIn((state)=> state.user)
	const devices = useDevices((state)=> state.devices)
	const viewableDevices = useDevices((state)=> state.viewableDevices)
	const currentDevice  = useDevices((state)=> state.currentDevice)
	const alarms = useAlarms((state)=> state.alarms)
	const runAlarm = useAlarms((state)=> state.runAlarm)
	const setToDelete = useAlarms((state)=> state.setToDelete)
	const setToEdit = useAlarms((state)=> state.setToEdit)
	const setShowEdit = usePopups((state)=> state.setShowEditAlarm)
	const setShowDelete = usePopups((state)=> state.setShowDeleteAlarm)
	const toggleActivity = useAlarms((state)=> state.toggleActivity)
	const timeForNextLaunch = useAlarms((state)=> state.timeForNextLaunch)
	const [ showTooltip, setShowTooltip] = useState("")

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

	const timeToUnits = (time: number) => {
		const days = Math.floor(time/ (60*60*24))
		const hours = Math.floor((time - days * (60*60*24))/(60*60))
		const minutes = Math.floor((time - days * (60*60*24) - hours *60*60)/(60)) 
		const seconds = Math.round((time - days * (60*60*24) - hours *60*60 - minutes*60))
		return {
					seconds: seconds,
					minutes: minutes,
					hours: hours,
					days: days
			   }
	}
	
	const renderAlarms = () => {
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

		return sortedView.map(({ id, occurence, time, weekdays, date, label, devices, active },key) => {
			return (
					<Tr 
						key={`alarm-item-${id}-${key}-row`}
						onMouseEnter={()=> timeTooltip(id )}
					>	
						<Td>
							{(id === ((runAlarm)?runAlarm.id:'')) ?<CheckIcon 
																		color={"green.900"}
																	/>:''
							}
						</Td>
						<Td
							key={`occurence-${id}-${key}`}
						>	
							<Tooltip
								label={showTooltip}
							>
								{occurence}
							</Tooltip>
							
						</Td>
						<Td
							key={`time-${id}-${key}`}
						>
							<Tooltip
								label={showTooltip}
							>
								{time}
							</Tooltip>
						</Td>
						<Td
							key={`weekdays-${id}-${key}`}
						>
							<Tooltip
								label={showTooltip}
							>
								{weekdayDisplay(weekdays, date)}
							</Tooltip>
						</Td>
						<Td
							key={`dateView-${id}-${key}`}
						>
							<Tooltip
								label={showTooltip}
							>
								{dateView(date, occurence)}
							</Tooltip>
						</Td>
						<Td
							key={`label-${id}`}
						>
							<Tooltip
								label={showTooltip}
							>
								{label}
							</Tooltip>
						</Td>
						<Td
							key={`devices-${id}-${key}`}
						>
							<Tooltip
								label={showTooltip}
							>
								{mapDeviceIDsToNames(devices)}
							</Tooltip>
						</Td>
						<Td
							key={`active-column-${id}-${key}`}
						>
							<Center>
								<Switch 
										name={`alarm-switch-${alarms[key].id}`}
										key={`alarm-active-${id}-${key}`}
										isChecked={active}
										size='md' 
										onChange={() => toggleActivity(id)}
										//key={`active-${id}`}
								/>
							</Center>
						</Td>
						<Td
							key={`editColumn-${id}`}
						>
							<Tooltip 
								label='Edit alarm' 
								fontSize='md'
								key={`edit-tip-${id}-${key}`}
							>
							<IconButton 
								size='xs' 
								icon={<EditIcon/>} 
								ml="5.5%" 
								aria-label=''
								key={`edit-${id}-${key}`}
								onClick= {() => { setToEdit(id); setShowEdit(true)}}
							/>
							</Tooltip>
						</Td>
						<Td
							key={`deleteColumn-${id}`}
						>
							<Tooltip 
								label='Delete alarm' 
								fontSize='md'
								key={`delete-tip-${id}-${key}`}
							>
							<IconButton 
								size='xs' 
								icon={<DeleteIcon/>} 
								ml="5.5%" 
								colorScheme='red'
								aria-label=''
								onClick= {() => { setToDelete(id); setShowDelete(true)}}
								key={`delete-${id}-${key}`}
							/>
							</Tooltip>
						</Td>
				</Tr>
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
				<Container 
					bg='blue.200' 
					maxW='fit-content'
					key="alarms-Container"
					id="Alarm-Container"
				>
					<Heading 
						as='h3' 
						size='sm'
						key="alarms-Header"
					>
						List of Alarms for selected devices for user {userInfo.screenName}. Currently on {currentDevice ? mapDeviceIDsToNames([currentDevice]):''}.
					</Heading>
					<TableContainer
						key="Alarms-Header-Table-Container"
					>
						<Table 
							variant='striped' 
							colorScheme='teal' 
							size='sm' 
							className="table-tiny" 
							id='table-Alarms'
							key="Alarms-Header-Table"
						>
							<TableCaption>
								<Text as='b'>
									{FooterText()}
								</Text>
							</TableCaption>
							<Thead>
								<Tr >
									<Th>
										Next
									</Th>
									<Th >
										Occurence
									</Th>
									<Th 
										isNumeric
									>
										Time
									</Th>
									<Th >
										Weekday
									</Th>
									<Th >
										date
									</Th>
									<Th >
										Label
									</Th>
									<Th >
										Devices
									</Th>
									<Th >
										Active
									</Th>
									<Th >
									</Th>
									<Th >
									</Th>
								</Tr>
							</Thead>
						<Tbody > 
							{renderAlarms()} 
						</Tbody>
						</Table>
					</TableContainer>
				</Container>
				<AddAlarmButton/>
			</>
		)
}

export default Alarms