import { useNavigate } from "react-router-dom"
import React, { useEffect } from "react"
import { useDevices, useLogIn, useAdmin, extend } from "../stores"
import { SessionStatus } from "../type"

const Navigator = () => {
    const currentDevice = useDevices((state)=> state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const adminNavigate = useAdmin((state) => state.adminNavigate)

    const  navigate = useNavigate()

	useEffect(() =>{
        //console.log(sessionStatus, currentDevice,adminNavigate)        

		if(sessionStatus !== SessionStatus.Valid){
			navigate(extend('/login'))
		}else if(sessionStatus === SessionStatus.Valid &&!currentDevice) {
			navigate(extend('/welcome'))
		}else if(sessionStatus === SessionStatus.Valid  && currentDevice){
            navigate(extend('/alarms'))
        }

	},[sessionStatus, currentDevice])
    useEffect(() =>{
        if(sessionStatus === SessionStatus.Valid && adminNavigate){
            navigate(extend('/admin'))
            useAdmin.setState({adminNavigate:false})
        }
    },[adminNavigate])
    return(<></>)
}
export default Navigator