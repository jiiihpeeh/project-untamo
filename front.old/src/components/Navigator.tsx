import React, { useEffect } from "react"
import { useDevices, useLogIn, useAdmin, extend  } from "../stores"
import { SessionStatus, Path } from "../type"
import { useNavigate } from "react-router-dom"
function Navigator() {
    const currentDevice = useDevices((state) => state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const adminNavigate = useAdmin((state) => state.adminNavigate)
    const navigateTo = useLogIn((state) => state.navigateTo)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)
    const navigate = useNavigate()

    useEffect(() => {
        //console.log(sessionStatus, currentDevice,adminNavigate)        
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
            navigate(extend(navigateTo))
            setNavigateTo(null)
        }
    },[navigateTo])
    return (<></>)
}
export default Navigator