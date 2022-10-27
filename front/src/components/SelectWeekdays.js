import { Button, Flex } from "@chakra-ui/react";   
import React from 'react';
import { useState } from "react";

const SelectedWeekdays = (props) => {
    const weekdays = [["Monday", "Mon"], ["Tuesday","Tue"],
            ["Wednesday","Wed"], ["Thursday","Thu"], ["Friday","Fri"], 
            ["Saturday", "Sat"], ["Sunday", "Sun"]];
    
    const [buttonColor, setButtonColor ] = useState(() => {
        let colorMap = new Map()
        for(const day of weekdays){
            if(props.days.includes(day)){
                colorMap.set(day[0], 'blue');
            }else{
                colorMap.set(day[0], 'gray');
            }
        }
        return colorMap;
    })
    const pushedButton = (day) => {
        if (props.days.includes(day)){
            props.setDays(props.days.filter(selectedDay => selectedDay !== day));
            buttonColor.set(day,'gray')
        }else{
            props.setDays([...props.days, day]); 
            buttonColor.set(day,'blue')
        }
        console.log(buttonColor)

    }

    const WeekdayButton = (weekday) => {
        return(
            <Button m="1px" 
                    bgColor={buttonColor.get(weekday[0])}
                    onClick={() => pushedButton(weekday[0])} 
                    id={`${weekday[0]}-button`} >
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
        <WeekdayFlex/>
    )
}
export default SelectedWeekdays;
    // <Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Saturday')}  borderWidth='2px' borderColor='black' borderRadius='md'>
