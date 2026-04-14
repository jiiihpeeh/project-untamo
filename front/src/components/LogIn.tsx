import { useEffect, useState } from "preact/hooks"
import { useLogIn,  usePopups, useSettings } from "../stores"
import { SessionStatus, Path, ColorMode } from "../type"
import { QrCode as QrCodeIcon } from '../ui/icons'

import '../App.css'

function LogIn() {
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const logIn = useLogIn((state) => state.logIn)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state) => state.windowSize)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navBarHeight = useSettings((state) => state.height)
    const colorMode = useSettings((state) => state.colorMode)
    const setShowPasswordForgot = usePopups((state) => state.setShowPasswordForgot)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)
    const setShowResendActivation = usePopups((state) => state.setShowResendActivation)
    const setShowQrCodeReader = usePopups((state) => state.setShowQrCodeReader)


    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [canSubmit, setCanSubmit] = useState(false)

    function onChange(event: Event & { target: HTMLInputElement }) {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name]: event.target.value
            }
        })
    }

    function onSubmit() {
        logIn(formData.email, formData.password)
        setNavigateTo(Path.Welcome)
    }

    useEffect(() => {
        if (sessionStatus == SessionStatus.Valid) {
            setNavigateTo(Path.Alarms)
        }else if (sessionStatus == SessionStatus.Activate) {
            setNavigateTo(Path.Activate)
        }
    }, [sessionStatus])

    useEffect(() => {
        function isOK() {
            if (formData.password.length > 5 && emailPattern.test(formData.email)) {
                setCanSubmit(true)
            } else {
                setCanSubmit(false)
            }
        }
        const emailPattern = new RegExp(".+@.+..+")
        isOK()
    }, [formData])

    function showLogIn() {
        switch (sessionStatus) {
            case SessionStatus.Validating:
                const radius = Math.min(windowSize.width / 2, windowSize.height / 2)
                const top = navBarTop ? windowSize.height / 2 - radius + navBarHeight : windowSize.height / 2 - radius - navBarHeight
                return (
                    <span
                        className="loading loading-spinner"
                        style={{ width: radius, height: radius, left: windowSize.width / 2 - radius / 2, top: top, position: "absolute" }}
                    />
                )
            case SessionStatus.Activate:
                setNavigateTo(Path.Activate)
                break
            default:
                return (
                    <div>
                        <form>
                            <div
                                className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
                                style={{ width: (isMobile) ? windowSize.width * 0.90 : Math.min(500, windowSize.width * 0.90), marginTop: "35%" }}
                            >
                                <div
                                    style={{ width: "95%", margin: "0 auto", marginTop: "15%" }}
                                >
                                    <div className="form-control">
                                        <label className="label" htmlFor="email">
                                            <span className="label-text">Email</span>
                                        </label>
                                        <input
                                            className="input input-bordered w-full"
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
                                            className="input input-bordered w-full"
                                            type="password"
                                            name="password"
                                            id="password"
                                            onChange={(e) => onChange(e as unknown as Event & { target: HTMLInputElement })}
                                            value={formData.password}
                                        />
                                    </div>
                                    <div className="divider my-1" />
                                    <button
                                        type="submit"
                                        id="submit"
                                        className={"btn " + ((colorMode === ColorMode.Dark) ? "btn-primary" : "btn-neutral")}
                                        onClick={() => onSubmit()}
                                        style={{ marginTop: "1%", marginBottom: "1%" }}
                                        disabled={!canSubmit}
                                    >
                                        Log In
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className="flex items-center justify-center">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2" style={{ marginTop: "50px" }}>
                                    <button
                                        className={"btn btn-xs " + ((colorMode === ColorMode.Dark) ? "btn-primary" : "btn-neutral")}
                                        onClick={() => setShowPasswordForgot(true)}
                                    >
                                        Forgot Password?
                                    </button>
                                    <div className="flex-1" />
                                    <button
                                        className="btn btn-xs btn-warning"
                                        style={{ marginLeft: "10px" }}
                                        onClick={() => setNavigateTo(Path.ResetPassword)}
                                    >
                                        Reset Password
                                    </button>
                                </div>
                                <button
                                    className="btn btn-xs btn-success"
                                    onClick={() => setShowResendActivation(true)}
                                >
                                    Didn't receive an activation email?
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-center" style={{ marginTop: "10px", marginBottom: "10px" }}>
                            <button
                                className={"btn btn-lg btn-square " + ((colorMode === ColorMode.Dark) ? "btn-primary" : "btn-neutral")}
                                aria-label="Scan QR code"
                                onClick={() => setShowQrCodeReader(true)}
                            >
                                <QrCodeIcon size={32} />
                            </button>
                        </div>
                    </div>
                )
        }
    }
    return (<>
        {showLogIn()}
    </>
    )
}

export default LogIn
