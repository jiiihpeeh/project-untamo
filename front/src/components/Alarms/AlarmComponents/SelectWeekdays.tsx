import { Button, Flex, Center } from "@chakra-ui/react"   
import React from 'react'
import useAlarm from "./alarmStates"
import { WeekDay } from '../../../type.d'

const SelectedWeekdays = () => {
    const weekdays = useAlarm((state)=> state.weekdays)
    const toggleWeekdays = useAlarm((state)=> state.toggleWeekdays)

    const WeekdayButton = (weekday: WeekDay, abbrev: string) => {
        return(
            <Button m="3px" 
                    borderColor={'black'} 
                    bgColor={(weekdays.includes(weekday))?"green":"gray.500" }
                    onClick={() => toggleWeekdays(weekday)} 
                    borderRadius={'md'}
                    borderWidth={'2px'}
                    colorScheme="orange"
                    w='38px' 
                    h='38px'
                    key={`${abbrev}-daySelectButtonKey`} 
                    id={`${abbrev}-daySelectButton`} 
            >
                {abbrev} 
            </Button>
        )
    }
    const WeekDayButtons = () => {
        const weekdays: Array<Array<string>> = [
                                                    ["Monday","Mon"], 
                                                    ["Tuesday","Tue"],  
                                                    ["Wednesday","Wed"], 
                                                    ["Thursday","Thu"], 
                                                    ["Friday","Fri"], 
                                                    ["Saturday","Sat"],
                                                    ["Sunday","Sun"]
                                                ]
        return weekdays.map(day =>
                                    {
                                        const enumDay = day[0] as WeekDay
                                        return WeekdayButton( enumDay, day[1])
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
