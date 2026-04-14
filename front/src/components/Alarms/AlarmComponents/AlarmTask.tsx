import React from "react"
import useAlarm from "./alarmStates"

function AlarmTask() {
    const setCloseTask = useAlarm((state) => state.setCloseTask);
    const closeTask = useAlarm((state) => state.closeTask);
    return (
        <div className="flex justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
                <span>Closing Task</span>
                <input type="checkbox" className="toggle toggle-lg" checked={closeTask}
                    onChange={() => setCloseTask(!closeTask)} />
            </label>
        </div>
    )
}
export default AlarmTask