import { Button, Flex } from "@chakra-ui/react";   
import React from 'react';

const SelectedWeekdays = (props) => {
    const pushedButton = (day) => {
        let selectedButton = document.getElementById(`${day}-button`)
        if (props.days.has(day)){
            props.days.delete(day);
            selectedButton.setAttribute('style','background-color: gray');

        }else{
            props.days.add(day);
            selectedButton.setAttribute('style','background-color: blue')
        }
        console.log(props.days);
    }

    const WeekdayButton = (weekday) => {
        return(
            <Button m="1px" 
                    bgColor="gray" 
                    onClick={() => pushedButton(weekday[0])} 
                    id={`${weekday[0]}-button`} >
            {weekday[1]} 
        </Button>
        )
    }
    
    const WeekdayFlex = () => {
       let weekdays = [["Monday", "Mon"], ["Tuesday","Tue"], ["Wednesday","Wed"], ["Thursday","Thu"], ["Friday","Fri"], ["Saturday", "Sat"], ["Sunday", "Sun"]];
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
