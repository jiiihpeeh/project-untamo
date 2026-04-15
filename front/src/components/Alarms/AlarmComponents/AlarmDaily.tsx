import React from "react"
import TimeSelector from "./TimeSelector"
import AlarmCase from "./AlarmCase"
import DeviceChecker from "./DeviceChecker"
import Message from "./Message"
import AlarmTune from "./AlarmTune"
import AlarmToggles from "./AlarmToggles"

function AlarmDaily() {
    return (
        <div className="flex justify-center">
            <div className="flex flex-col gap-3 w-full">
                <Message />
                <div className="grid grid-cols-2 gap-3">
                    <TimeSelector />
                    <AlarmCase />
                </div>
                <DeviceChecker />
                <AlarmToggles />
                <AlarmTune />
            </div>
        </div>
    )
}

export default AlarmDaily
