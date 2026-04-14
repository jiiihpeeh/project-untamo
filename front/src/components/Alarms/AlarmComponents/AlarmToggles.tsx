import React from "react"
import AlarmActive from "./AlarmActive"
import AlarmTask from "./AlarmTask"

function AlarmToggles() {
    return (
        <div className="flex items-center justify-center gap-4" onMouseDown={e => e.preventDefault()}>
            <AlarmActive />
            <AlarmTask />
        </div>
    )
}
export default AlarmToggles