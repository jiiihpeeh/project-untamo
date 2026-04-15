import React from 'preact/compat'
import TimeSelector from "./TimeSelector"
import AlarmCase from "./AlarmCase"
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
                <div className="grid grid-cols-2 gap-3">
                    <TimeSelector />
                    <AlarmCase />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <DeviceChecker />
                    <SelectedWeekdays />
                </div>
                <AlarmToggles />
                <AlarmTune />
            </div>
        </div>
    )
}

export default AlarmWeekly
