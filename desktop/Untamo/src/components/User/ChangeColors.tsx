import React from 'preact/compat'
import { useSettings, usePopups } from "../../stores"
import LoadColorScheme from "./LoadColors"

function ChangeAlarmColors() {
    const setShowChangeColors = usePopups((state) => state.setShowChangeColors)
    const showChangeColors = usePopups((state) => state.showChangeColors)
    const setDefaultCardColors = useSettings((state) => state.setDefaultCardColors)

    if (!showChangeColors) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-sm">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowChangeColors(false)}>✕</button>
                <h3 className="font-bold text-lg mb-4">Color Mode Change</h3>
                <p>Do you want to change the alarm colors?</p>
                <div className="modal-action flex gap-2">
                    <button className="btn btn-error" onClick={() => setShowChangeColors(false)}>Cancel</button>
                    <LoadColorScheme setter={setShowChangeColors} setterValue={false} />
                    <button className="btn btn-success" onClick={() => {
                        setShowChangeColors(false)
                        setDefaultCardColors()
                    }}>Default</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowChangeColors(false)} />
        </div>
    )
}

export default ChangeAlarmColors
