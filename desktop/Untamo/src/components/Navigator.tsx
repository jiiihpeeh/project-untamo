import React, { useEffect } from 'preact/compat'
import { useDevices, useLogIn, useAdmin, extend } from "../stores"
import { SessionStatus, Path } from "../type"

function Navigator() {
    const currentDevice = useDevices((state) => state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const adminNavigate = useAdmin((state) => state.adminNavigate)
    const navigateTo = useLogIn((state) => state.navigateTo)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    useEffect(() => {
        if (sessionStatus !== SessionStatus.Valid) {
            setNavigateTo(Path.LogIn)
        } else if (sessionStatus === SessionStatus.Valid && !currentDevice) {
            setNavigateTo(Path.Welcome)
        } else if (sessionStatus === SessionStatus.Valid && currentDevice) {
            setNavigateTo(Path.Alarms)
        }
    }, [sessionStatus, currentDevice])

    useEffect(() => {
        if (sessionStatus === SessionStatus.Valid && adminNavigate) {
            setNavigateTo(Path.Admin)
            useAdmin.setState({ adminNavigate: false })
        }
    }, [adminNavigate])

    useEffect(() => {
        if (navigateTo) {
            window.history.pushState(null, '', extend(navigateTo))
            window.dispatchEvent(new PopStateEvent('popstate'))
            setNavigateTo(null)
        }
    }, [navigateTo])

    return (<></>)
}

export default Navigator