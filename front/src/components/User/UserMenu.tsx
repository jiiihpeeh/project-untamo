import React, { useEffect } from "react"
import { useLogIn, usePopups } from "../../stores"
import { SessionStatus } from "../../type"
import { refreshToken } from "../../stores/loginStore"

function UserMenu() {
    const userInfo = useLogIn((state) => state.user)
    const setShowLogOut = usePopups((state) => state.setShowLogOut)
    const setShowAbout = usePopups((state) => state.setShowAbout)
    const setShowEditProfile = usePopups((state) => state.setShowEditProfile)
    const setShowAdminLogIn = usePopups((state) => state.setShowAdminLogIn)
    const showUserMenu = usePopups((state) => state.showUserMenu)
    const setShowUserMenu = usePopups((state) => state.setShowUserMenu)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const [isSessionValid, setIsSessionValid] = React.useState(sessionStatus === SessionStatus.Valid)

    useEffect(() => {
        setIsSessionValid(sessionStatus === SessionStatus.Valid)
    }, [sessionStatus])

    if (!showUserMenu) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-xs">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowUserMenu(false)}>✕</button>
                <h3 className="font-bold text-lg mb-4">User Actions</h3>
                <div className="flex flex-col gap-2">
                    <button
                        className="btn btn-block"
                        disabled={!isSessionValid}
                        onClick={() => { setShowEditProfile(true); setShowUserMenu(false) }}
                    >
                        Edit Profile
                    </button>
                    {userInfo.admin && (
                        <button
                            className="btn btn-block btn-error"
                            disabled={!isSessionValid}
                            onClick={() => { setShowAdminLogIn(true); setShowUserMenu(false) }}
                        >
                            Admin Log In
                        </button>
                    )}
                    <button
                        id="logout-button"
                        className="btn btn-block btn-error btn-outline"
                        onClick={() => { setShowLogOut(true); setShowUserMenu(false) }}
                    >
                        Log Out
                    </button>
                    <button
                        className="btn btn-block"
                        onClick={() => { refreshToken(false); setShowUserMenu(false) }}
                    >
                        Check &amp; Refresh Session
                    </button>
                    <button
                        className="btn btn-block"
                        onClick={() => { setShowAbout(true); setShowUserMenu(false) }}
                    >
                        About Untamo
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowUserMenu(false)} />
        </div>
    )
}

export default UserMenu
