import { useState, useEffect } from 'preact/hooks'
import { useLogIn, usePopups, useSettings  } from '../stores'
import { ColorMode, PasswordReset, Path } from '../type'

function ResetPassword(){
    const [formData, setFormData] = useState<PasswordReset>({
        email: "",
        password: "",
        confirmPassword: "",
        passwordResetToken: ""
    })
    const windowSize = usePopups((state) => state.windowSize)
    const colorMode = useSettings((state) => state.colorMode)
    const isMobile = usePopups((state) => state.isMobile)
    const resetPassword = useLogIn((state) => state.resetPassword)
    const [canSubmit, setCanSubmit] = useState(false)
    const emailPattern = new RegExp(".+@.+..+")
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    function onChange(event: Event & { target: HTMLInputElement }) {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name]: event.target.value
            }
        })
    }

    useEffect(() => {
        function isOK() {
            if (formData.password.length > 5 && formData.password === formData.confirmPassword && formData.passwordResetToken.length > 5 && emailPattern.test(formData.email)) {
                setCanSubmit(true)
            } else {
                setCanSubmit(false)
            }
        }
        isOK()
    }, [formData])

    return (
        <form>
            <div
                className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
                style={{
                    width: (isMobile) ? windowSize.width * 0.90 : Math.min(500, windowSize.width * 0.90),
                    marginTop: "35%"
                }}
            >
                <div style={{ width: "95%", margin: "0 auto", marginTop: "15%" }}>
                    <div className="form-control">
                        <label className="label" htmlFor="email">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            className="input input-bordered w-full Register"
                            type="email"
                            name="email"
                            id="email"
                            onChange={(e) => onChange(e as unknown as Event & { target: HTMLInputElement })}
                            value={formData.email}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label" htmlFor="password">
                            <span className="label-text">Password</span>
                        </label>
                        <input
                            className="input input-bordered w-full Register"
                            type="password"
                            name="password"
                            id="password"
                            onChange={(e) => onChange(e as unknown as Event & { target: HTMLInputElement })}
                            value={formData.password}
                        />
                    </div>
                    <div className="divider my-1" />
                    <div className="form-control">
                        <label className="label" htmlFor="confirmPassword">
                            <span className="label-text">Confirm Password</span>
                        </label>
                        <input
                            className="input input-bordered w-full Register"
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            onChange={(e) => onChange(e as unknown as Event & { target: HTMLInputElement })}
                            value={formData.confirmPassword}
                        />
                    </div>
                    <div className="divider my-1" />
                    <div className="form-control">
                        <label className="label" htmlFor="passwordResetToken">
                            <span className="label-text">Password Reset Token</span>
                        </label>
                        <input
                            className="input input-bordered w-full Register"
                            type="password"
                            name="passwordResetToken"
                            id="passwordResetToken"
                            onChange={(e) => onChange(e as unknown as Event & { target: HTMLInputElement })}
                            value={formData.passwordResetToken}
                        />
                    </div>
                    <div className="divider my-1" />
                    <button
                        type="button"
                        className={"btn " + ((colorMode === ColorMode.Dark) ? "btn-primary" : "btn-neutral")}
                        onClick={() => resetPassword(formData)}
                        style={{ marginTop: "1%", marginBottom: "1%" }}
                        disabled={!canSubmit}
                    >
                        Reset Password
                    </button>
                    <div>
                        <button
                            type="button"
                            className={"btn " + ((colorMode === ColorMode.Dark) ? "btn-primary" : "btn-neutral")}
                            onClick={() => setNavigateTo(Path.LogIn)}
                            style={{ marginBottom: "1%" }}
                        >
                            Back to LogIn
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default ResetPassword
