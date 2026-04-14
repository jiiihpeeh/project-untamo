import React from "react"
import useAlarm from "./alarmStates"

function AlarmActive() {
    const setActive = useAlarm((state) => state.setActive);
    const active = useAlarm((state) => state.active);
    return (
        <div className="flex justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
                <span>Active</span>
                <input type="checkbox" className="toggle toggle-lg" checked={active}
                    onChange={() => setActive(!active)} />
            </label>
        </div>
    )
}
export default AlarmActive