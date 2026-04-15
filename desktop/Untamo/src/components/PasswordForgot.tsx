import React, { useState } from 'react';
import { useLogIn, usePopups } from '../stores';

function PasswordForgot() {
    const setShowPasswordForgot = usePopups((state) => state.setShowPasswordForgot)
    const showPasswordForgot = usePopups((state) => state.showPasswordForgot)
    const forgotPassword = useLogIn((state) => state.forgotPassword)
    const [email, setEmail] = useState('')

    if (!showPasswordForgot) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowPasswordForgot(false)}
                >✕</button>
                <h3 className="font-bold text-lg mb-4">Reset Password</h3>
                <div className="py-2">
                    <span>Enter your email address to reset your password.</span>
                    <div className="form-control mt-2">
                        <input
                            className="input input-bordered w-full"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                        />
                    </div>
                </div>
                <div className="modal-action">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowPasswordForgot(false)}
                    >
                        Cancel
                    </button>
                    <div className="flex-1" />
                    <button
                        className="btn btn-success"
                        onClick={() => {
                            setShowPasswordForgot(false)
                            forgotPassword(email)
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowPasswordForgot(false)} />
        </div>
    )
}

export default PasswordForgot
