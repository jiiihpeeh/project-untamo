import { useNavigate } from "react-router-dom"
import React, { useEffect } from "react"
import { useDevices, useLogIn, useAdmin, extend } from "../stores"
import { SessionStatus, Path } from "../type"

const Navigator = () => {
    const currentDevice = useDevices((state)=> state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const adminNavigate = useAdmin((state) => state.adminNavigate)

    const  navigate = useNavigate()

	useEffect(() =>{
        //console.log(sessionStatus, currentDevice,adminNavigate)        

		if(sessionStatus !== SessionStatus.Valid){
			navigate(extend(Path.LogIn))
		}else if(sessionStatus === SessionStatus.Valid &&!currentDevice) {
			navigate(extend(Path.Welcome))
		}else if(sessionStatus === SessionStatus.Valid  && currentDevice){
            navigate(extend(Path.Alarms))
        }

	},[sessionStatus, currentDevice])
    useEffect(() =>{
        if(sessionStatus === SessionStatus.Valid && adminNavigate){
            navigate(extend(Path.Admin))
            useAdmin.setState({adminNavigate:false})
        }
    },[adminNavigate])
    return(<></>)
}
export default Navigator