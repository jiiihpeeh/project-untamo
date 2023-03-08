import { useEffect, useContext, useState } from "react"
import DeviceSelector from "../Devices/DeviceSelector"
import { Button, Icon, Div,Text, Input, Image, Modal, Dropdown } from 'react-native-magnus'
import { dayContinuationDays } from "./calcAlarmTime"
import { useAlarms, useLogIn, useDevices } from "../../stores"
import {  Alarm, WeekDay, AlarmCases } from '../../type'
import useAlarm from "./AlarmComponents/alarmStates"

interface Props{
    onPress: () => void
    alarm: Alarm
}
const AlarmButton = (props: Props) => {
    const dayDisplay = (alarm: Alarm ) => {
        //console.log(alarm)
        let dayArr = dayContinuationDays(alarm.weekdays)
        let dayList: Array<string> = []
        for(const day of dayArr){
            dayList.push(day.join('-'))
        }
        //console.log(dayList)
        return dayList.join(', ')
    }
    const Time = () => {
            return(
                    <Text 
                        fontSize="6xl" 
                        fontWeight="bold" 
                        mt="lg" 
                        color="gray"
                    >
                        {props.alarm.time}
                    </Text>
                )
    }
    const Weekdays = () => {
        return(
            <Text 
                fontSize="5xl" 
                fontWeight="bold" 
                mt="lg" 
                color="gray"

            >
                {dayDisplay(props.alarm)}
            </Text>
        )
    }
    const Days = () => {
        return(
            <Text 
                fontSize="5xl" 
                fontWeight="bold" 
                mt="lg" 
                color="gray"
            >
                Monday-Sunday
            </Text>
        )
    }
    const Date = () => {
        return(
            <Text 
                fontSize="5xl" 
                fontWeight="bold" 
                mt="lg" 
                color="gray"
            >
                {props.alarm.date}
            </Text>
        )
    }
    const Weekly = () => {
        return(
            <Button 
                m={10} 
                bg={(props.alarm.active)?"yellow":"gray200"}
                onPress={()=> props.onPress()} 
            >
                <Time/>
                <Div flex={1} alignItems={"center"} row={false}>
                <Text>Weekly: {props.alarm.label}</Text>
                    <Div row >
                        <Div>
                            <Weekdays/>
                        </Div>
                    </Div>
                </Div>
            </Button>
        )
    }
    const Once = () => {
        return(
            <Button 
                m={10} 
                bg={(props.alarm.active)?"yellow":"gray200"}
                onPress={()=>props.onPress()}
            >
                <Time/>
                <Div    flex={1} 
                        alignItems={"center"} 
                        row={false}>
                <Text>Once: {props.alarm.label}</Text>
                    <Div row >
                        <Div>
                            <Date/>
                        </Div>
                    </Div>
                </Div>
            </Button>
        )
    }
    const Daily = () => {
        return(
            <Button 
                m={10} 
                bg={(props.alarm.active)?"yellow":"gray200"}
                onPress={()=> props.onPress()} 
            >                
                <Time/>
                <Div 
                    flex={1} 
                    alignItems={"center"} 
                    row={false}
                >
                <Text>
                    Daily: {props.alarm.label}
                </Text>
                    <Div row >
                        <Div>
                            <Days/>
                        </Div>
                    </Div>
                </Div>
            </Button>
        )
    }
    const Yearly = () => {
        return(
            <Button 
                m={10} 
                bg={(props.alarm.active)?"yellow":"gray200"}
                onPress={()=> props.onPress()} 
            >
                <Time/>
                <Div 
                    flex={1} 
                    alignItems={"center"} 
                    row={false}
                >
                <Text>Yearly: {props.alarm.label}</Text>
                    <Div row >
                        <Div>
                            <Date/>
                        </Div>
                    </Div>
                </Div>
            </Button>
        )
    }
    console.log("alarm BUTTOn ",props)
    return(
        <>  
            {props.alarm.occurence === AlarmCases.Weekly &&
            <Weekly/>}
            {props.alarm.occurence === AlarmCases.Once &&
            <Once/>}
            {props.alarm.occurence === AlarmCases.Daily &&
            <Daily/>}
            {props.alarm.occurence ===  AlarmCases.Yearly &&
            <Yearly/>}            
        </>
    )
}

export default AlarmButton