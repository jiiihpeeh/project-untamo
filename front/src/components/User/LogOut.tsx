import React from "react"
import { useLogIn, usePopups } from "../../stores"

function LogOut() {
    const sessionLogOut = useLogIn((state) => state.logOut)
    const setShowLogOut = usePopups((state) => state.setShowLogOut)
    const showLogOut = usePopups((state) => state.showLogOut)

    if (!showLogOut) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-lg mb-4">Log Out?</h3>
                <p>Are you sure?</p>
                <div className="modal-action">
                    <button className="btn" onClick={() => setShowLogOut(false)}>Cancel</button>
                    <button className="btn btn-error"
                        onClick={() => { sessionLogOut(); setShowLogOut(false) }}>OK</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowLogOut(false)} />
        </div>
    )
}

export default LogOut
