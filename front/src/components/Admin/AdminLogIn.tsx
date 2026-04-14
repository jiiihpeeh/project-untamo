import React from 'react'
import { useAdmin, usePopups } from '../../stores'

const AdminLogin = () => {
    const adminPassword = useAdmin((state) => state.password)
    const setAdminPassword = useAdmin((state) => state.setPassword)
    const adminLogIn = useAdmin((state) => state.adminLogIn)
    const setShowAdminLogIn = usePopups((state) => state.setShowAdminLogIn)
    const showAdminLogIn = usePopups((state) => state.showAdminLogIn)

    const onLogIn = async () => {
        adminLogIn()
        setShowAdminLogIn(false)
    }

    if (!showAdminLogIn) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box max-w-sm">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowAdminLogIn(false)}>✕</button>
                <h3 className="font-semibold text-lg mb-4">Request admin rights?</h3>
                <div className="form-control">
                    <label className="label"><span className="label-text">Password</span></label>
                    <input
                        className="input input-bordered w-full"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword((e.target as HTMLInputElement).value)}
                    />
                </div>
                <div className="modal-action">
                    <button className="btn btn-outline btn-sm" onClick={() => setShowAdminLogIn(false)}>Cancel</button>
                    <button className="btn btn-error btn-sm" onClick={onLogIn}>Apply</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowAdminLogIn(false)} />
        </div>
    )
}
export default AdminLogin
