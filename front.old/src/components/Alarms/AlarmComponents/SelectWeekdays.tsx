import React from 'react'
import useAlarm from "./alarmStates"
import { WeekDay } from '../../../type'

const SelectedWeekdays = () => {
    const weekdays = useAlarm((state)=> state.weekdays)
    const toggleWeekdays = useAlarm((state)=> state.toggleWeekdays)

    function isOn(day:number, days:number) {
        const mask = 1 << day
        return (days & mask) !== 0
    }
    function WeekdayButton(weekday: WeekDay, abbrev: string, count: number) {
        const isActive = isOn(count, weekdays)
        return(
            <button 
                style={{ margin: "3px", borderColor: 'black', background: isActive ? "green" : "#6b7280" }}
                onClick={() => toggleWeekdays(count)}
                className="btn"
                id={`${abbrev}-daySelectButton`} 
            >
                {abbrev} 
            </button>
        )
    }
    const WeekDayButtons = () => {
        let WeekDayTuple : [ day: WeekDay, abbrev: string, count: number]
        const weekdays: Array<typeof WeekDayTuple> =    [
                                                            [ WeekDay.Monday, "Mon" ,0] ,
                                                            [ WeekDay.Tuesday, "Tue" ,1],
                                                            [ WeekDay.Wednesday, "Wed", 2 ],
                                                            [ WeekDay.Thursday, "Thu" , 3],
                                                            [ WeekDay.Friday, "Fri" , 4],
                                                            [ WeekDay.Saturday, "Sat",5 ],
                                                            [ WeekDay.Sunday, "Sun", 6 ]
                                                        ]
        return weekdays.map(day =>  {
                                        return WeekdayButton(day[0], day[1], day[2])
                                    }
        )
    }
    return(
        <div className="center">
            <div className="flex">
                {WeekDayButtons()}
            </div>
        </div>
    )
}
export default SelectedWeekdays