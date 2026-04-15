import React, {  useEffect } from 'preact/compat'
import { useServer,  usePopups, useSettings, useLogIn } from '../../stores'
import useRegister from './RegisterBackend'
import { CheckCircle as CheckCircleIcon, Ban as NotAllowedIcon, AlertTriangle as WarningTwoIcon } from '../../ui/icons'
import { Path, ColorMode } from '../../type'
import '../../App.css'

function Register() {
    const registered = useRegister((state) => state.registered)
    const register = useRegister((state) => state.register)
    const firstName = useRegister((state) => state.firstName)
    const setFirstName = useRegister((state) => state.setFirstName)
    const lastName = useRegister((state) => state.lastName)
    const setLastName = useRegister((state) => state.setLastName)
    const email = useRegister((state) => state.email)
    const setEmail = useRegister((state) => state.setEmail)
    const password = useRegister((state) => state.password)
    const setPassword = useRegister((state) => state.setPassword)
    const formCheck = useRegister((state) => state.formCheck)
    const confirmPassword = useRegister((state) => state.confirmPassword)
    const setConfirmPassword = useRegister((state) => state.setConfirmPassword)
    const clearForm = useRegister((state) => state.clear)
    const getFormData = useRegister((state) => state.formData)
    const setFormTimeout = useRegister((state) => state.setFormTimeOut)
    const clearFormTimeout = useRegister((state) => state.clearFormTimeout)
    const setFormCheck = useRegister((state) => state.setFormCheck)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state) => state.windowSize)
    const colorMode = useSettings((state) => state.colorMode)
    const wsRegisterMessage = useServer((state) => state.wsRegisterMessage)
    const wsDisconnect = useServer((state) => state.wsRegisterDisconnect)
    const sendMessage = useServer((state) => state.wsRegisterSendMessage)
    const question = useRegister((state) => state.question)
    const setQuestion = useRegister((state) => state.setQuestion)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    function PasswordMatch() {
        let checkmark = (password.length > 5 && password === confirmPassword)
            ? <CheckCircleIcon size={16} />
            : <NotAllowedIcon size={16} />
        return <span>{checkmark}</span>
    }

    function PasswordCheck() {
        let checkmark = (password.length > 5 && formCheck)
            ? <CheckCircleIcon size={16} />
            : <WarningTwoIcon size={16} />
        return <span>{checkmark}</span>
    }

    useEffect(() => {
        if (registered) {
            clearForm()
            setNavigateTo(Path.LogIn)
            wsDisconnect()
        }
    }, [registered])

    useEffect(() => {
        clearFormTimeout()
        let query = setTimeout(() => {
            if (password.length > 4 && email.length > 3) {
                sendMessage(JSON.stringify({ ...getFormData() }))
            }
        }, 200)
        setFormTimeout(query)
    }, [firstName, lastName, email, password])

    useEffect(() => {
        console.log("wsRegisterMessage", wsRegisterMessage)
        if (!wsRegisterMessage) {
            return
        }
        setFormCheck(wsRegisterMessage.formPass)
    }, [wsRegisterMessage])

    return (
        <div
            style={{
                width: (isMobile) ? windowSize.width * 0.90 : Math.min(500, windowSize.width * 0.90),
                marginTop: "30%"
            }}
            className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
        >
            <div style={{ width: "95%", margin: "0 auto" }}>
                <div className="form-control">
                    <label className="label" htmlFor="firstName">
                        <span className="label-text">First name (Optional)</span>
                    </label>
                    <input
                        className="input input-bordered w-full"
                        type="text"
                        name="firstName"
                        id="firstName"
                        onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
                        value={firstName}
                    />
                </div>
                <div className="form-control">
                    <label className="label" htmlFor="lastName">
                        <span className="label-text">Last name (Optional)</span>
                    </label>
                    <input
                        className="input input-bordered w-full"
                        type="text"
                        name="lastName"
                        id="lastName"
                        onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
                        value={lastName}
                    />
                </div>
                <div className="form-control">
                    <label className="label" htmlFor="email">
                        <span className="label-text">Email (Required)</span>
                    </label>
                    <input
                        className="input input-bordered w-full"
                        type="email"
                        name="email"
                        id="email"
                        onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                        value={email}
                    />
                </div>
                <div className="form-control">
                    <label className="label" htmlFor="password">
                        <span className="label-text">Password</span>
                    </label>
                    <div className="flex items-center gap-0">
                        <input
                            className="input input-bordered flex-1"
                            type="password"
                            name="password"
                            id="password"
                            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                            value={password}
                        />
                        <span className="input input-bordered flex items-center justify-center px-3">
                            <PasswordCheck />
                        </span>
                    </div>
                </div>
                <div className="form-control">
                    <label className="label" htmlFor="confirmPassword">
                        <span className="label-text">Confirm Password</span>
                    </label>
                    <div className="flex items-center gap-0">
                        <input
                            className="input input-bordered flex-1"
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
                            value={confirmPassword}
                        />
                        <span className="input input-bordered flex items-center justify-center px-3">
                            <PasswordMatch />
                        </span>
                    </div>
                </div>
                {/* Honeypot field — visually hidden */}
                <div style={{ display: "none" }}>
                    <label htmlFor="question">What is 2+7?</label>
                    <input
                        type="text"
                        name="question"
                        id="question"
                        onChange={(e) => setQuestion((e.target as HTMLInputElement).value)}
                        value={question}
                    />
                </div>
                <button
                    className="btn btn-primary"
                    style={{ margin: "5px" }}
                    onClick={() => register()}
                    disabled={!( formCheck && password === confirmPassword )}
                >
                    Register
                </button>
            </div>
        </div>
    )
}

export default Register
