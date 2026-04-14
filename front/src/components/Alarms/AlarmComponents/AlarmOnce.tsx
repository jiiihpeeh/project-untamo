import React from "react"
import TimeSelector from "./TimeSelector"
import DateSelector from "./DateSelector"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import AlarmTune from "./AlarmTune"
import AlarmToggles from "./AlarmToggles"

function AlarmOnce() {
    return (
        <div className="flex justify-center">
            <div className="flex flex-col gap-3 w-full">
                <Message />
                <TimeSelector />
                <DateSelector />
                <DeviceChecker />
                <AlarmToggles />
                <AlarmTune />
            </div>
        </div>
    )
}

export default AlarmOnce