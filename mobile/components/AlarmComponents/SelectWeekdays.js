import { Text, Div, Button } from 'react-native-magnus';
import React, { useContext } from 'react';
import { AlarmComponentsContext } from "./AlarmComponentsContext";

import { View } from 'react-native';
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
            <Div alignItems='center'>
            <View>
            <Button ml={1}
                    mt={10}
                    borderColor={'black'} 
                    bg={(weekdays.includes(weekday.day))?"green":"gray" }
                    onPress={() => pushedButton(weekday.day)} 
                    borderRadius={'xs'}
                    borderWidth={2}
                    w={48} 
                    h={45} >
                <Text fontSize={9}>{weekday.abbrev} </Text>
            </Button>
            </View>
            </Div>
        )
    };
    return(
        <Div alignItems='center'>
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
