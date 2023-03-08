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
    const alarm = props.alarm
    const onPress = props.onPress

    const dayDisplay = (alarm: Alarm ) => {
        let dayArr = dayContinuationDays(alarm.weekdays)
        let dayList: Array<string> = []
        for(const day of dayArr){
            dayList.push(day.join('-'))
        }
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
                        {alarm.time}
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
                    {dayDisplay(alarm)}
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
                    {alarm.date}
                </Text>
        )
    }
    const Weekly = () => {
        return(
                <Button 
                    m={10} 
                    bg={(alarm.active)?"yellow":"gray200"}
                    onPress={()=> onPress()} 
                >
                    <Time/>
                    <Div 
                        flex={1} 
                        alignItems={"center"} 
                        row={false}
                    >
                    <Text>
                        Weekly: {alarm.label}
                    </Text>
                        <Div 
                            row 
                        >
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
                    bg={(alarm.active)?"yellow":"gray200"}
                    onPress={()=>onPress()}
                >
                    <Time/>
                    <Div    
                        flex={1} 
                        alignItems={"center"} 
                        row={false}
                    >
                    <Text>
                        Once: {alarm.label}
                    </Text>
                        <Div 
                            row
                        >
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
                    bg={(alarm.active)?"yellow":"gray200"}
                    onPress={()=> onPress()} 
                >                
                    <Time/>
                    <Div 
                        flex={1} 
                        alignItems={"center"} 
                        row={false}
                    >
                    <Text>
                        Daily: {alarm.label}
                    </Text>
                        <Div 
                            row 
                        >
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
                    bg={(alarm.active)?"yellow":"gray200"}
                    onPress={()=> onPress()} 
                >
                    <Time/>
                    <Div 
                        flex={1} 
                        alignItems={"center"} 
                        row={false}
                    >
                    <Text>
                        Yearly: {alarm.label}
                    </Text>
                        <Div row >
                            <Div>
                                <Date/>
                            </Div>
                        </Div>
                    </Div>
                </Button>
        )
    }
    const RenderedButton = () => {
        switch(alarm.occurence){
            case AlarmCases.Weekly:
                return (<Weekly/>)
            case AlarmCases.Once:
                return (<Once/>)
            case AlarmCases.Daily:
                return (<Daily/>)
            case AlarmCases.Yearly:
                return(<Yearly/>)
        }
    }
    return(
        <>  
            {RenderedButton()}       
        </>
    )
}

export default AlarmButton