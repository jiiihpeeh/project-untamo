import { useEffect, useContext, useState } from "react";

import { DeviceContext } from "../context/DeviceContext";
import { SessionContext } from "../context/SessionContext";

import DeviceSelector from "./DeviceSelector";
import { Button, Icon, Div,Text, View, Input, Image, Modal, Dropdown } from 'react-native-magnus';

import { dayContinuationDays } from "./calcAlarmTime";

const AlarmButton = (props) => {
    const { token, userInfo, sessionStatus} = useContext(SessionContext);
    const { currentDevice, devices, setDevices } = useContext(DeviceContext);
    
    const dayDisplay = (alarm) => {
        console.log(alarm)
        let dayArr = dayContinuationDays(alarm.wday);
        let dayList = [];
        for(const day of dayArr){
            dayList.push(day.join('-'));
        }
        console.log(dayList)
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
                onPress={()=>props.setEditID(props.alarm._id)}
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
                onPress={()=>props.setEditID(props.alarm._id)}
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
                onPress={()=>props.setEditID(props.alarm._id)}
            >                
                <Time/>
                <Div flex={1} alignItems={"center"} row={false}>
                <Text>Daily: {props.alarm.label}</Text>
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
                onPress={()=>props.setEditID(props.alarm._id)}
            >
                <Time/>
                <Div flex={1} alignItems={"center"} row={false}>
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
            {props.alarm.occurence === 'weekly' &&
            <Weekly/>}
            {props.alarm.occurence === 'once' &&
            <Once/>}
            {props.alarm.occurence === 'daily' &&
            <Daily/>}
            {props.alarm.occurence === 'yearly' &&
            <Yearly/>}            
        </>
    )
}

export default AlarmButton;