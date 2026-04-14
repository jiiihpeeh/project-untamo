import { useEffect } from "preact/hooks"
import type { JSX } from 'preact'
import { Trash2 as DeleteIcon } from '../../ui/icons'
import AdminConfirm from "./AdminConfirm"
import { usePopups, useLogIn, useAdmin, useSettings } from "../../stores"
import { AdminAction, Path } from '../../type'

function Admin() {
    const userInfo = useLogIn((state) => state.user)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const adminTime = useAdmin((state) => state.time)
    const usersData = useAdmin((state) => state.usersData)
    const getUsersData = useAdmin((state) => state.getUsersData)
    const setConfirmOpen = usePopups((state) => state.setShowAdminConfirm)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)
    const isOwner = useLogIn((state) => state.user.owner)

    function initDelete(id: string) {
        useAdmin.setState({ command: { id, action: AdminAction.Delete } })
        setConfirmOpen(true)
    }
    function initChangeActivity(id: string) {
        useAdmin.setState({ command: { id, action: AdminAction.Activity } })
        setConfirmOpen(true)
    }
    function initChangeAdminState(id: string) {
        useAdmin.setState({ command: { id, action: AdminAction.Admin } })
        setConfirmOpen(true)
    }

    function renderUsers() {
        if (!usersData || usersData.length === 0) return [] as JSX.Element[]
        return usersData.map(({ active, admin, owner, email, user }, key) => {
            const isCurrentUser = userInfo.email === email
            return (
                <div key={`user-${key}`} className="card bg-base-200 shadow-sm mb-3 p-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4 flex-wrap">
                            <span><strong>ID:</strong> {user}</span>
                            <span><strong>Email:</strong> {email}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="flex items-center gap-2">
                                <strong>Active:</strong>
                                <input type="checkbox" className="toggle toggle-sm"
                                    checked={active}
                                    disabled={owner || isCurrentUser}
                                    onChange={() => initChangeActivity(user)} />
                            </label>
                            <label className="flex items-center gap-2">
                                <strong>Admin:</strong>
                                <input type="checkbox" className="toggle toggle-sm"
                                    checked={admin}
                                    disabled={owner || isCurrentUser}
                                    onChange={() => initChangeAdminState(user)} />
                            </label>
                            <label className="flex items-center gap-2">
                                <strong>Delete:</strong>
                                <button
                                    className="btn btn-sm btn-error"
                                    disabled={owner || isCurrentUser}
                                    onClick={() => initDelete(user)}
                                ><DeleteIcon size={14} /></button>
                            </label>
                        </div>
                    </div>
                </div>
            )
        })
    }

    useEffect(() => {
        if (!sessionStatus || adminTime < Date.now()) setNavigateTo(Path.Alarms)
    }, [adminTime, sessionStatus])
    useEffect(() => { getUsersData() }, [])

    return (
        <div className="flex flex-col items-center py-8 px-4">
            <div className="flex flex-col gap-3 mb-6">
                <button className="btn btn-primary" onClick={getUsersData}>Update User List</button>
                <button className="btn" disabled={!isOwner} onClick={() => setNavigateTo(Path.Owner)}>
                    Server Configuration (Owner Only)
                </button>
            </div>
            <div className="w-full max-w-2xl">
                {renderUsers()}
            </div>
            <AdminConfirm />
        </div>
    )
}

export default Admin
