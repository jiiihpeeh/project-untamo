import { useNavigate } from "react-router-dom"
import React, { useEffect } from "react"
import { useDevices, useLogIn, useAdmin } from "../stores"
import { SessionStatus } from "../type.d"

const Navigator = () => {
    const currentDevice = useDevices((state)=> state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const adminNavigate = useAdmin((state) => state.adminNavigate)

    const  navigate = useNavigate()

	useEffect(() =>{
        //console.log(sessionStatus, currentDevice,adminNavigate)
		if(sessionStatus !== SessionStatus.Valid){
			navigate('/login')
		}else if(sessionStatus === SessionStatus.Valid &&!currentDevice) {
			navigate('/welcome')
		}else if(sessionStatus === SessionStatus.Valid  && currentDevice){
            navigate('/alarms')
        }
	},[sessionStatus, currentDevice])
    useEffect(() =>{
        if(sessionStatus === SessionStatus.Valid && adminNavigate){
            navigate('/admin')
            useAdmin.setState({adminNavigate:false})
        }
    },[adminNavigate])
    return(<></>)
}
export default Navigator