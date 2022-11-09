import { Text, Div, Button } from 'react-native-magnus';
import React, { useContext } from 'react';
import { AlarmComponentsContext } from "./AlarmComponentsContext";


const SelectedWeekdays = (props) => {
    const { weekdays, setWeekdays } = useContext(AlarmComponentsContext);
    const pushedButton = (day) => {
        if (weekdays.includes(day)){
            setWeekdays(weekdays.filter(selectedDay => selectedDay !== day));
        }else{
            setWeekdays([...weekdays, day]); 
        }
    };

    const WeekdayButton = (weekday) => {
        return(
            <Button ml={2}
                    mt={10}
                    borderColor={'black'} 
                    bg={(weekdays.includes(weekday.day))?"green":"gray" }
                    onPress={() => pushedButton(weekday.day)} 
                    borderRadius={'md'}
                    borderWidth={2}
                    w={60} 
                    h={45} >
                {weekday.abbrev} 
            </Button>
        )
    };
    return(
        <Div>
            <Text textAlign='center'>Select Weekdays</Text>
            <Div row>
                <WeekdayButton day="Monday" abbrev="Mon"/>
                <WeekdayButton day="Tuesday" abbrev="Tue"/>
                <WeekdayButton day="Wednesday" abbrev="Wed"/>
                <WeekdayButton day="Thursday" abbrev="Thu"/>
                <WeekdayButton day="Friday" abbrev="Fri"/>
                <WeekdayButton day="Saturday" abbrev="Sat"/>
                <WeekdayButton day="Sunday" abbrev="Sun"/>
            </Div>
        </Div>
    )
};
export default SelectedWeekdays;
