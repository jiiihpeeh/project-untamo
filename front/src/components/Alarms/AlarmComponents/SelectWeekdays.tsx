import { Button, Flex, Center } from "@chakra-ui/react"   
import React from 'react'
import useAlarm from "./alarmStates"
import { WeekDay } from '../../../type'

const SelectedWeekdays = () => {
    const weekdays = useAlarm((state)=> state.weekdays)
    const toggleWeekdays = useAlarm((state)=> state.toggleWeekdays)

    const WeekdayButton = (weekday: WeekDay, abbrev: string) => {
        return(
            <Button 
                m="3px" 
                borderColor={'black'} 
                bgColor={(weekdays.includes(weekday))?"green":"gray.500" }
                onClick={() => toggleWeekdays(weekday)}
                onTouchEnd={(e)=>console.log(e)} 
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
        let WeekDayTuple : [ day: WeekDay, abbrev: string]
        const weekdays: Array<typeof WeekDayTuple> =    [
                                                            [ WeekDay.Monday, "Mon" ] ,
                                                            [ WeekDay.Tuesday, "Tue" ],
                                                            [ WeekDay.Wednesday, "Wed" ],
                                                            [ WeekDay.Thursday, "Thu" ],
                                                            [ WeekDay.Friday, "Fri" ],
                                                            [ WeekDay.Saturday, "Sat" ],
                                                            [ WeekDay.Sunday, "Sun" ]
                                                        ]
        return weekdays.map(day =>  {
                                        return WeekdayButton(day[0], day[1])
                                    }
        )
    }
    return(
        <Center>
            <Flex>
                {WeekDayButtons()}
            </Flex>
        </Center>
    )
}
export default SelectedWeekdays
