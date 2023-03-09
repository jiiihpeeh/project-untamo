import React from "react"
import AlarmOnce from "./AlarmOnce"
import AlarmWeekly from "./AlarmWeekly"
import AlarmDaily from "./AlarmDaily"
import AlarmYearly from "./AlarmYearly"
import AlarmCase from "./AlarmCase"
import { Divider } from "@chakra-ui/react"
import useAlarm, { AlarmCases } from "./alarmStates"

const AlarmSelector = () => {
    const alarmCase = useAlarm((state)=> state.occurence)
    const renderCase = () => {
        switch(alarmCase){
            case AlarmCases.Once:
                return(<AlarmOnce/>)
            case AlarmCases.Weekly:
                return(<AlarmWeekly/>)
            case AlarmCases.Daily:
                return(<AlarmDaily/>)
            case AlarmCases.Yearly:
                return(<AlarmYearly/>)
        }
    }
    return(<>
                <AlarmCase/>
                <Divider m={'5px'}/>
                {renderCase()}
            </>
          )
}

export default AlarmSelector
