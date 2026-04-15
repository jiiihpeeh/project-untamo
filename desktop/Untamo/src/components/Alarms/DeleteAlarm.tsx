import React from 'preact/compat'
import { useAlarms, usePopups } from '../../stores'
import { stringifyTime } from './AlarmComponents/stringifyDate-Time'

function DeleteAlarm() {
    const showDelete = usePopups((state) => state.showDeleteAlarm)
    const setShowDelete = usePopups((state) => state.setShowDeleteAlarm)
    const deleteAlarm = useAlarms((state) => state.deleteAlarm)
    const alarms = useAlarms((state) => state.alarms)
    const toDelete = useAlarms((state) => state.alarmToDelete)
    const alarm = alarms.find(a => a.id === toDelete)

    if (!alarm || !showDelete) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-lg mb-4">
                    Delete alarm ({alarm.occurrence}, {stringifyTime(alarm.time)} for {alarm.devices.length} devices)?
                </h3>
                <p>Are you sure?</p>
                <div className="modal-action">
                    <button className="btn" onClick={() => setShowDelete(false)}>Cancel</button>
                    <button className="btn btn-error" onClick={() => { deleteAlarm(); setShowDelete(false) }}>OK</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowDelete(false)} />
        </div>
    )
}

export default DeleteAlarm
