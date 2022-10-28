import { Button, Flex, Center } from "@chakra-ui/react";   
import React from 'react';
import { useState } from "react";

const SelectedWeekdays = (props) => {
    const weekdays = [["Monday", "Mon"], ["Tuesday","Tue"],
            ["Wednesday","Wed"], ["Thursday","Thu"], ["Friday","Fri"], 
            ["Saturday", "Sat"], ["Sunday", "Sun"]];
    
    const [ buttonColor ] = useState(() => {
        let colorMap = new Map()
        for(const day of weekdays){
            if(props.days.includes(day)){
                colorMap.set(day[0], 'green');
            }else{
                colorMap.set(day[0], 'gray.200');
            }
        }
        return colorMap;
    })
    const pushedButton = (day) => {
        if (props.days.includes(day)){
            props.setDays(props.days.filter(selectedDay => selectedDay !== day));
            buttonColor.set(day,'gray.200')
        }else{
            props.setDays([...props.days, day]); 
            buttonColor.set(day,'green')
        }
        console.log(buttonColor)

    }

    const WeekdayButton = (weekday) => {
        return(
            <Button m="1px" 
                    bgColor={buttonColor.get(weekday[0])}
                    onClick={() => pushedButton(weekday[0])} 
                    id={`${weekday[0]}-button`}
                    borderColor='black' 
                    borderRadius='md'
                    w='40px' 
                    h='40px' >
            {weekday[1]} 
        </Button>
        )
    }
    
    const WeekdayFlex = () => {
       let weekDayButtons = [];
       for (const day of weekdays){
          weekDayButtons.push(WeekdayButton(day));
       }
       return(
            <Flex>{weekDayButtons}</Flex>
       )
    }
  

    return(
        <Center>
            <WeekdayFlex/>
        </Center>
        
    )
}
export default SelectedWeekdays;
