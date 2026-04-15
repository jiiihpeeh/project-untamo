import React from "react"
import AlarmOnce from "./AlarmOnce"
import AlarmWeekly from "./AlarmWeekly"
import AlarmDaily from "./AlarmDaily"
import AlarmYearly from "./AlarmYearly"
import useAlarm from "./alarmStates"
import { AlarmCases }  from "../../../type"

function AlarmSelector() {
    const alarmCase = useAlarm((state) => state.occurrence)
    const renderCase = () => {
        switch (alarmCase) {
            case AlarmCases.Once:
                return (<AlarmOnce />)
            case AlarmCases.Weekly:
                return (<AlarmWeekly />)
            case AlarmCases.Daily:
                return (<AlarmDaily />)
            case AlarmCases.Yearly:
                return (<AlarmYearly />)
        }
    }
    return (<>
        {renderCase()}
    </>
    )
}

export default AlarmSelector
