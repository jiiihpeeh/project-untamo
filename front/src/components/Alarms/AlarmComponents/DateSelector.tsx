import React from "react";
import useAlarm from "./alarmStates"

const DateSelector = () => {
    const date = useAlarm((state)=>state.date)
    const dateFormat = useAlarm((state)=>state.dateFormat);
    const setDate = useAlarm((state)=>state.setDate)

    const formatDateForInput = (d: Date) => {
        return d.toISOString().split('T')[0]
    }

    return(
        <div className="flex" onMouseDown={e=>e.preventDefault()}>
            <div className="center">
                <label className="form-label">
                    Date
                </label>
                <input
                    type="date"
                    className="input"
                    style={{ width: 'auto' }}
                    name="date-input"
                    value={formatDateForInput(date)}
                    onChange={(e) => setDate(new Date((e.target as HTMLInputElement).value))}
                />
            </div>
        </div>
    )
}
export default DateSelector