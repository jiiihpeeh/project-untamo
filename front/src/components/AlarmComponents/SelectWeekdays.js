import { Button, Flex, Center } from "@chakra-ui/react";   
import React from 'react';


const SelectedWeekdays = (props) => {
    
    const pushedButton = (day) => {
        if (props.days.includes(day)){
            props.setDays(props.days.filter(selectedDay => selectedDay !== day));
        }else{
            props.setDays([...props.days, day]); 
        }
    };

    const WeekdayButton = (weekday) => {
        return(
            <Button m="3px" 
                    borderColor={'black'} 
                    bgColor={(props.days.includes(weekday.day))?"green":"gray.200" }
                    onClick={() => pushedButton(weekday.day)} 
                    borderRadius={'md'}
                    borderWidth={'2px'}
                    w='38px' 
                    h='38px' >
                {weekday.abbrev} 
            </Button>
        )
    };
    return(
        <Center>
            <Flex>
                <WeekdayButton day="Monday" abbrev="Mon"/>
                <WeekdayButton day="Tuesday" abbrev="Tue"/>
                <WeekdayButton day="Wednesday" abbrev="Wed"/>
                <WeekdayButton day="Thursday" abbrev="Thu"/>
                <WeekdayButton day="Friday" abbrev="Fri"/>
                <WeekdayButton day="Saturday" abbrev="Sat"/>
                <WeekdayButton day="Sunday" abbrev="Sun"/>
            </Flex>
        </Center>
    )
};
export default SelectedWeekdays;
    // <Button w='40px' h='40px' bg='gray.200' onClick={()=>wdaySelect('Saturday')}  borderWidth='2px' borderColor='black' borderRadius='md'>