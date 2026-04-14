import React from "react"
import TimeSelector from "./TimeSelector"
import SelectedWeekdays from "./SelectWeekdays"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import AlarmTune from "./AlarmTune"
import AlarmToggles from "./AlarmToggles"

function AlarmWeekly() {
    return (
        <div className="flex justify-center">
            <div className="flex flex-col gap-3 w-full">
                <Message />
                <TimeSelector />
                <SelectedWeekdays />
                <DeviceChecker />
                <AlarmToggles />
                <AlarmTune />
            </div>
        </div>
    )
}

export default AlarmWeekly