import React from 'preact/compat'
import AlarmSelector from './AlarmComponents/AlarmSelector'
import useAlarm from './AlarmComponents/alarmStates'
import { useAlarms, usePopups } from '../../stores'

function AddAlarm() {
    const addNewAlarm = useAlarms((state) => state.addNewAlarm)
    const setShowToast = usePopups((state) => state.setShowToast)
    const showAddAlarm = usePopups((state) => state.showAddAlarm)
    const setShowAddAlarm = usePopups((state) => state.setShowAddAlarm)
    const alarmFromDialog = useAlarm((state) => state.alarmFromDialog)

    async function onAdd(event: MouseEvent) {
        (event.currentTarget as HTMLButtonElement).disabled = true
        const alarm = alarmFromDialog()
        if (alarm) addNewAlarm(alarm)
        setShowAddAlarm(false)
        setShowToast(true)
    }
    function onDrawerClose() {
        setShowToast(true)
        setShowAddAlarm(false)
    }

    if (!showAddAlarm) return null

    return (
        <div className={`modal ${showAddAlarm ? 'modal-open' : ''}`} id="add_alarm_modal">
            <div className="modal-box">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Add an alarm</h2>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onDrawerClose}>✕</button>
                </div>
                <AlarmSelector />
                <div className="flex justify-end gap-2 mt-6">
                    <button className="btn btn-outline" onClick={onDrawerClose}>Cancel</button>
                    <button className="btn btn-success" onClick={(e) => onAdd(e as any)}>Save</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onDrawerClose}></div>
        </div>
    )
}

export default AddAlarm