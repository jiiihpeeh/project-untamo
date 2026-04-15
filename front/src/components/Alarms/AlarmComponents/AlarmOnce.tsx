import React from "react"
import TimeSelector from "./TimeSelector"
import AlarmCase from "./AlarmCase"
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
                <div className="grid grid-cols-2 gap-3">
                    <TimeSelector />
                    <AlarmCase />
                </div>
                <DateSelector />
                <DeviceChecker />
                <AlarmToggles />
                <AlarmTune />
            </div>
        </div>
    )
}

export default AlarmOnce
