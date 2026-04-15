import { useState } from 'preact/compat';
import { useLogIn, usePopups } from '../stores';

function ResendActivation() {
    const setShowResendActivation = usePopups((state) => state.setShowResendActivation)
    const showResendActivation = usePopups((state) => state.showResendActivation)
    const sendActivation = useLogIn((state) => state.resendActivation)
    const [email, setEmail] = useState<string>('')

    if (!showResendActivation) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowResendActivation(false)}
                >✕</button>
                <h3 className="font-bold text-lg mb-4">Resend Activation</h3>
                <div className="py-2">
                    <span>Enter your email address to send a new activation code.</span>
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
                        onClick={() => setShowResendActivation(false)}
                    >
                        Cancel
                    </button>
                    <div className="flex-1" />
                    <button
                        className="btn btn-success"
                        onClick={() => {
                            setShowResendActivation(false)
                            sendActivation(email)
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowResendActivation(false)} />
        </div>
    )
}

export default ResendActivation
