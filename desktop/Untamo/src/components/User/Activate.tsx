import React, { useEffect, useState } from 'preact/compat'
import { useLogIn } from "../../stores"

function Activate() {
    const captcha = useLogIn((state) => state.captcha)
    const fetchCaptcha = useLogIn((state) => state.fetchCaptcha)
    const activate = useLogIn((state) => state.activate)
    const [captchaText, setCaptchaText] = useState("")
    const [verificationCode, setVerificationCode] = useState("")

    useEffect(() => {
        if (!captcha) fetchCaptcha()
    }, [])

    return (
        <div className="flex flex-col items-center gap-4 p-5">
            <h1 className="text-2xl font-bold">Activate</h1>
            <form className="flex flex-col gap-3 w-full max-w-sm">
                <div className="form-control">
                    <label className="label"><span className="label-text">Enter Activation Code</span></label>
                    <input
                        className="input input-bordered w-full"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode((e.target as HTMLInputElement).value)}
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => activate(verificationCode, captchaText, false)}
                >
                    Activate
                </button>
            </form>
        </div>
    )
}

export default Activate
