import React, { useEffect } from 'preact/compat'
import AlarmSelector from './AlarmComponents/AlarmSelector'
import { useAlarms, usePopups } from '../../stores'
import useAlarm from './AlarmComponents/alarmStates'

function EditAlarm() {
    const editAlarm = useAlarms((state) => state.editAlarm)
    const showEdit = usePopups((state) => state.showEditAlarm)
    const toEdit = useAlarms((state) => state.alarmToEdit)
    const alarms = useAlarms((state) => state.alarms)
    const alarmFromDialog = useAlarm((state) => state.alarmFromDialog)
    const setShowEdit = usePopups((state) => state.setShowEditAlarm)
    const alarmToEditDialog = useAlarm((state) => state.alarmToEditDialog)

    useEffect(() => {
        if (showEdit && toEdit) {
            const alarm = alarms.find(a => a.id === toEdit)
            if (alarm) alarmToEditDialog(alarm)
        }
    }, [showEdit])

    function onEdit() {
        const alarm = alarmFromDialog()
        if (alarm) editAlarm(alarm)
        setShowEdit(false)
    }
    function onDrawerClose() { setShowEdit(false) }

    if (!showEdit) return null

    return (
        <div className={`modal ${showEdit ? 'modal-open' : ''}`} id="edit_alarm_modal">
            <div className="modal-box">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Edit Alarm</h2>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onDrawerClose}>✕</button>
                </div>
                <AlarmSelector />
                <div className="flex justify-end gap-2 mt-6">
                    <button className="btn btn-outline" onClick={onDrawerClose}>Cancel</button>
                    <button className="btn btn-success" onClick={onEdit}>Save</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onDrawerClose}></div>
        </div>
    )
}

export default EditAlarm
