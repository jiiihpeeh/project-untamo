import { Button, Flex, Center } from "@chakra-ui/react";   
import React, { useContext } from 'react';
import { AlarmComponentsContext } from "./AlarmComponentsContext";


const SelectedWeekdays = (props) => {
    const {weekdays, setWeekdays } = useContext(AlarmComponentsContext);
    const pushedButton = (day) => {
        if (weekdays.includes(day)){
            setWeekdays(weekdays.filter(selectedDay => selectedDay !== day));
        }else{
            setWeekdays([...weekdays, day]); 
        }
    };

    const WeekdayButton = (weekday) => {
        return(
            <Button m="3px" 
                    borderColor={'black'} 
                    bgColor={(weekdays.includes(weekday.day))?"green":"gray.200" }
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