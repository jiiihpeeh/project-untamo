import {Link as ReachLink} from 'react-router-dom'
import { Text, Link, Spacer, HStack, Avatar, Flex, Box, Image } from '@chakra-ui/react'
import React, { useState, useEffect, useLayoutEffect } from "react"
import Countdown from "react-countdown"
import { timePadding } from "./Alarms/AlarmComponents/stringifyDate-Time"
import { useNavigate } from 'react-router-dom'
import { useLogIn, useAdmin, useTimeouts, usePopups, extend, useAlarms } from '../stores'
import { SessionStatus } from '../type'
import { MenuType } from '../stores/popUpStore'
import AlarmPop from './Alarms/AlarmFollower'
import sleep from './sleep'
import './../App.css'

const NavGrid = () => {
    const logo = useAlarms((state)=>state.logo)
    const adminTime = useAdmin((state) => state.time )
    const sessionStatus  = useLogIn((state) => state.sessionValid)
    const userInfo  = useLogIn((state) => state.user)
    const setShowAbout = usePopups((state)=> state.setShowAbout)
    const setShowServerEdit = usePopups((state)=> state.setShowServerEdit)
    const clearAdminTimeout = useTimeouts((state)=> state.clearAdminTimeout)
    const setAdminTimeout = useTimeouts((state)=> state.setAdminID)
    const setShowUserMenu = usePopups((state)=> state.setShowUserMenu)
    const setShowDeviceMenu = usePopups((state)=> state.setShowDeviceMenu)
    const showDeviceMenu =  usePopups((state)=> state.showDeviceMenu)
    const showUserMenu = usePopups((state)=> state.showUserMenu)
    const windowSize = usePopups((state)=> state.windowSize)
    const setWindowSize = usePopups((state)=> state.setWindowSize)

    const isMobile = usePopups((state)=> state.isMobile)

    const [ validItems, setValidItems ] = useState(["login", "register", "about"])
    const [ showAdmin, setShowAdmin ] = useState(false)
    
    const navigate  = useNavigate()
    useLayoutEffect(() => {
        function updateSize() {
            setWindowSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', updateSize)
        updateSize()
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    interface TextArg {
        text: string
    }
    const capitalize = (s:string)=>{
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    interface TimeOutput{
        minutes: number,
        seconds: number
    }
    const timeOutput = ({ minutes, seconds,}: TimeOutput) => {
        return `Admin (${timePadding(minutes)}:${timePadding(seconds)})`
    }
   
    useEffect(() => {
        const constructGrid = async() => {
            if(sessionStatus === SessionStatus.Valid){
                setValidItems(["alarms", "devices", 'user'])
            } else {
                setValidItems(["register",'server', "about"])  
                await sleep(15)
                let isLogIn = window.location.pathname.replaceAll("/","").endsWith("login")
                if(!isLogIn){
                    setValidItems(["login",'server', "about"])    
                }else{
                    setValidItems(["register",'server', "about"])
                }  
            }
        }
        constructGrid()
    },[sessionStatus])

    
    useEffect(()=> {
        const adminTimeOut = () =>{
            setShowAdmin(false)
            if(window.location.pathname === '/admin'){
                navigate(extend('/alarms'))
            }
        }
        try{
            clearAdminTimeout()
        }catch(err){}
        if(adminTime > Date.now()){
            setShowAdmin(true)
        }else{
            setShowAdmin(false)
        }
        
        let tID = setTimeout(adminTimeOut, adminTime - Date.now())
        setAdminTimeout(tID)
        
    },[adminTime, navigate])
 
    return (
            <Flex 
                display="flex" 
                alignItems="center"
                position="fixed"
                justifyContent="space-between"
                as="header"
                width={10}
                zIndex={500}
                alignContent={"left"}
                background="radial-gradient(circle, rgba(52,124,228,0.5704482476584384) 50%, rgba(157,182,225,0) 100%)"
                style={{width:windowSize.width, left:0,right:windowSize.width, top:0}}
            >
                
                <Image 
                    ml={"2px"}
                    src={logo}
                    height={"50px"}
                    className='LogoClock'
                />
                <Text>
                    Untamo
                </Text>
                { validItems.includes('login') && <>
                    <Spacer/>
                    <Link 
                        as={ReachLink} 
                        to={extend(`/login`)} 
                        id={`link-login`} 
                        onClick={()=> setValidItems([...validItems,'register'].filter(l => l !== 'login'))}
                    >
                        <Text 
                            as='b'
                        >
                            LogIn
                        </Text>
                    </Link>
                </>}
                {validItems.includes('register') && <>
                    <Spacer/>
                    <Link 
                        as={ReachLink} 
                        to={extend(`/register`)} 
                        id={`link-register`} 
                        onClick={()=> setValidItems([...validItems,'login'].filter(l => l !== 'register'))}
                    >
                        <Text 
                            as='b'
                        >
                            Register
                        </Text>
                    </Link>
                </>}
                {validItems.includes('alarms') && <>
                    <Spacer/>
                    <AlarmPop/>
                </>}
                {validItems.includes('devices') && <>
                    <Spacer/>
                    <Link 
                        key="deviceMenu-link"
                        onClick={()=> setShowDeviceMenu(!showDeviceMenu)}
                    >   
                        <Text 
                            as="b"
                            id="link-DeviceMenu"
                        >
                            Devices
                        </Text>

                    </Link>
                </>}
                {validItems.includes('server') && <>
                    <Spacer/>
                    <Link
                        onClick={()=> setShowServerEdit(true)}
                    >
                        <Text as='b'>
                            {(isMobile)?`Server`:`Server Location`}
                        </Text>
                    </Link>
                </>}
                {validItems.includes('about') && <>
                    <Spacer/>
                    <Link 
                        onClick={()=>setShowAbout(true)}
                    >
                        <Text as='b'>
                            About
                        </Text>
                    </Link></>}
                {showAdmin && <>
                    <Spacer/>
                    <Link 
                        key="admin-link"
                        as={ReachLink} 
                        to={`/admin`} 
                        id={`link-admin`} 
                    >
                        <Text  
                            color='red' 
                            as='b'
                        >
                            <Countdown  
                                date={adminTime}
                                renderer={timeOutput}
                            />
                        </Text>
                    </Link>
                </>}
                {validItems.includes('user') && <>
                    <Spacer/>
                    <div>
                        <Link
                            as={Avatar} 
                            name={userInfo.screenName} 
                            size='sm'
                            id="avatar-button"
                            onClick={()=> setShowUserMenu(!showUserMenu)}
                        />
                    </div>
                </>}
                    <Spacer/>
            </Flex>
        )
    
}

export default NavGrid