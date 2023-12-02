import { Button, Flex, Center } from "@chakra-ui/react"   
import React from 'react'
import useAlarm from "./alarmStates"
import { WeekDay } from '../../../type'

function SelectedWeekdays() {
    const weekdays = useAlarm((state) => state.weekdays)
    const toggleWeekdays = useAlarm((state) => state.toggleWeekdays)

    function isOn(day: number, days: number) {
        const mask = 1 << day // Bitmask for the specified weekday

        // Check if the specified weekday is on
        return (days & mask) !== 0
    }
    function WeekdayButton(weekday: WeekDay, abbrev: string, count: number) {
        return (
            <Button
                m="3px"
                borderColor={'black'}
                bgColor={(isOn(count, weekdays)) ? "green" : "gray.500"}
                onClick={() => toggleWeekdays(count)}
                //onTouchEnd={(e)=>console.log(e)} 
                borderRadius={'md'}
                borderWidth={'2px'}
                colorScheme="orange"
                w='40px'
                h='40px'
                key={`${abbrev}-daySelectButtonKey`}
                id={`${abbrev}-daySelectButton`}
            >
                {abbrev}
            </Button>
        )
    }
    const WeekDayButtons = () => {
        let WeekDayTuple: [day: WeekDay, abbrev: string, count: number]
        const weekdays: Array<typeof WeekDayTuple> = [
            [WeekDay.Monday, "Mon", 0],
            [WeekDay.Tuesday, "Tue", 1],
            [WeekDay.Wednesday, "Wed", 2],
            [WeekDay.Thursday, "Thu", 3],
            [WeekDay.Friday, "Fri", 4],
            [WeekDay.Saturday, "Sat", 5],
            [WeekDay.Sunday, "Sun", 6]
        ]
        return weekdays.map(day => {
            return WeekdayButton(day[0], day[1], day[2])
        }
        )
    }
    return (
        <Center>
            <Flex>
                {WeekDayButtons()}
            </Flex>
        </Center>
    )
}
export default SelectedWeekdays
