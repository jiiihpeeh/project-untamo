import React, { useRef, useEffect, useState } from 'react'
import { useAdmin, usePopups } from '../../stores'
import { AdminAction } from '../../type'

function AdminChangeActivity() {
    const [message, setMessage] = useState({ action: '', message: '', button: '' })
    const runAdminAction = useAdmin((state) => state.adminAction)
    const setShowAdminConfirm = usePopups((state) => state.setShowAdminConfirm)
    const showAdminConfirm = usePopups((state) => state.showAdminConfirm)
    const command = useAdmin((state) => state.command)

    function cancelDialog() { setShowAdminConfirm(false) }
    async function acceptChange() { runAdminAction(); setShowAdminConfirm(false) }

    useEffect(() => {
        switch (command.action) {
            case AdminAction.Delete:
                setMessage({ action: 'Delete?', message: 'Delete user? User information will be erased.', button: 'Delete user' })
                break
            case AdminAction.Admin:
                setMessage({ action: 'Admin Status', message: 'Admin status of the user will be changed', button: 'Change Admin Status' })
                break
            case AdminAction.Activity:
                setMessage({ action: 'Activity Status', message: 'Activity status of the user will be changed. Current sessions will be erased if accepted and activity is turned OFF', button: 'Change Activity Status' })
                break
        }
    }, [command])

    if (!showAdminConfirm) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-lg mb-4">{message.action}</h3>
                <p>{message.message}</p>
                <div className="modal-action">
                    <button className="btn" onClick={cancelDialog}>Cancel</button>
                    <button className="btn btn-error" onClick={acceptChange}>{message.button}</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={cancelDialog} />
        </div>
    )
}

export default AdminChangeActivity
