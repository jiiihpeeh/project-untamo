import { useAdmin, usePopups, useSettings } from '../../stores'
import React, { useState, useEffect } from 'react'
import type { CSSProperties } from 'preact/compat'

const AdminPop = () => {
    const windowSize = usePopups((state) => state.windowSize)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navHeight = useSettings((state) => state.height)
    const setAdminTime = useAdmin((state) => state.setTime)
    const setAdminToken = useAdmin((state) => state.setAdminAccessToken)
    const showAdminPop = usePopups((state) => state.showAdminPop)
    const setShowAdminPop = usePopups((state) => state.setShowAdminPop)
    const navigationTriggered = usePopups((state) => state.navigationTriggered)
    const [posStyle, setPosStyle] = useState<CSSProperties>({})

    useEffect(() => {
        const elem = document.getElementById("link-admin")
        if (elem) {
            const coords = elem.getBoundingClientRect()
            setPosStyle({
                position: 'fixed',
                left: coords.left + coords.width / 2,
                top: navBarTop ? navHeight : windowSize.height - navHeight,
            })
        }
    }, [navigationTriggered])

    if (!showAdminPop) return null
    return (
        <div
            className="fixed z-50 bg-base-100 rounded-box shadow-lg border border-base-300 p-4 min-w-40"
            style={posStyle}
            onMouseDown={e => e.preventDefault()}
        >
            <div className="font-semibold text-center mb-3">Admin Info</div>
            <div className="flex justify-center">
                <button
                    className="btn btn-sm"
                    onClick={() => { setAdminToken(''); setAdminTime(0); setShowAdminPop(false) }}
                >
                    End Admin Session
                </button>
            </div>
        </div>
    )
}

export default AdminPop
