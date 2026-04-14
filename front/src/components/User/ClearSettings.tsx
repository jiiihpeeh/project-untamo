import React from 'react'
import { usePopups, useLogIn } from '../../stores'

function ClearSettings() {
    const logOut = useLogIn((state) => state.logOut)
    const setShowSettings = usePopups((state) => state.setShowSettings)
    const setShowClearSettings = usePopups((state) => state.setShowClearSettings)
    const showClearSettings = usePopups((state) => state.showClearSettings)

    if (!showClearSettings) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1010 }}>
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-lg mb-4">Clear settings and Log Out</h3>
                <p>Are you sure?</p>
                <div className="modal-action">
                    <button className="btn" onClick={() => setShowClearSettings(false)}>Cancel</button>
                    <button className="btn btn-error" onClick={() => {
                        logOut()
                        localStorage.clear()
                        setShowSettings(false)
                        window.location.reload()
                    }}>OK</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowClearSettings(false)} />
        </div>
    )
}

export default ClearSettings
