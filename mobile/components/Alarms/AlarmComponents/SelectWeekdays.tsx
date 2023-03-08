import { Text, Div, Button } from 'react-native-magnus'
import React from 'react'
import useAlarm from './alarmStates'
import { View } from 'react-native'
import { WeekDay } from '../../../type'



function SelectedWeekdays() {
    const selectedWeekdays = useAlarm((state) => state.weekdays)
    const setWeekdays = useAlarm((state) => state.toggleWeekdays)

    const WeekdayButton = (weekday : WeekDay, abbrev: string) => {
        return (
            <Div
                alignItems='center'
                key={abbrev}
            >
                <View>
                    <Button
                        ml={1}
                        mt={10}
                        borderColor={'black'}
                        bg={(selectedWeekdays.includes(weekday)) ? "green" : "gray"}
                        onPress={() => setWeekdays(weekday)}
                        borderWidth={2}
                        w={48}
                        h={45}
                    >
                        <Text
                            fontSize={9}
                        >
                            {abbrev}
                        </Text>
                    </Button>
                </View>
            </Div>
        )
    }
    const WeekDayButtons = () => {
        let WeekDayTuple : [ day: WeekDay, abbrev: string]
        const weekdays: Array<typeof WeekDayTuple> =    [
                                                            [WeekDay.Monday, "Mon"],
                                                            [WeekDay.Tuesday, "Tue"],
                                                            [WeekDay.Wednesday, "Wed"],
                                                            [WeekDay.Thursday, "Thu"],
                                                            [WeekDay.Friday, "Fri"],
                                                            [WeekDay.Saturday, "Sat"],
                                                            [WeekDay.Sunday, "Sun"]
                                                        ]
        return weekdays.map(day =>  {
                                        return WeekdayButton(day[0], day[1])
                                    }
        )
    }
    return (
        <Div alignItems='center'>
            <Text textAlign='center'>Select Weekdays</Text>
            <Div row>
                {WeekDayButtons()}
            </Div>
        </Div>
    )
}
export default SelectedWeekdays
