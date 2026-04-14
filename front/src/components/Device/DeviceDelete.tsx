import React, { useEffect, useState } from "react"
import { useDevices, usePopups } from "../../stores"

function DeviceDelete() {
    const deleteDevice = useDevices((state) => state.deleteDevice)
    const showDelete = usePopups((state) => state.showDeleteDevice)
    const setShowDelete = usePopups((state) => state.setShowDeleteDevice)
    const toDelete = useDevices((state) => state.deviceToDelete)
    const setToDelete = useDevices((state) => state.setDeviceToDelete)
    const [deleteID, setDeleteId] = useState<null | string>(null)

    function cancel() { setShowDelete(false); setToDelete(null) }

    useEffect(() => {
        if (toDelete) setDeleteId(toDelete.id)
    }, [toDelete])

    if (!showDelete) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1010 }} id="DeviceDeletePopUp">
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-lg mb-4">
                    Delete device <strong>{toDelete ? toDelete.deviceName : ''}</strong>?
                </h3>
                <p>Are you sure?</p>
                <div className="modal-action">
                    <button className="btn" onClick={cancel}>Cancel</button>
                    <button className="btn btn-error" onClick={() => {
                        deleteDevice(deleteID ?? '')
                        setShowDelete(false)
                    }}>Delete</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={cancel} />
        </div>
    )
}
export default DeviceDelete
