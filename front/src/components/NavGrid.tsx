import {Link as ReachLink} from 'react-router-dom'
import { Text, Link, Spacer, HStack, Avatar } from '@chakra-ui/react'
import React, { useState, useEffect } from "react"
import Countdown from "react-countdown"
import { timePadding } from "./Alarms/AlarmComponents/stringifyDate-Time"
import { useNavigate } from 'react-router-dom'
import { useLogIn, useAdmin, useTimeouts, usePopups } from '../stores'
import { SessionStatus } from '../type.d'
import { MenuType } from '../stores/popUpStore'

const NavGrid = () => {
    const adminTime = useAdmin((state) => state.time )
    const sessionStatus  = useLogIn((state) => state.sessionValid)
    const userInfo  = useLogIn((state) => state.user)
    const setShowAbout = usePopups((state)=> state.setShowAbout)
    const setShowServerEdit = usePopups((state)=> state.setShowServerEdit)
    const clearAdminTimeout = useTimeouts((state)=> state.clearAdminTimeout)
    const setAdminTimeout = useTimeouts((state)=> state.setAdminID)
    const setShowUserMenu = usePopups((state)=> state.setShowUserMenu)
    const setShowDeviceMenu = usePopups((state)=> state.setShowDeviceMenu)
    const showDeviceMenu =  usePopups((state)=> state.showDeviceMenu.show)
    const showUserMenu = usePopups((state)=> state.showUserMenu.show)
    const [ validItems, setValidItems ] = useState(["login", "register", "about"])
    const [ showAdmin, setShowAdmin ] = useState(false)
    const navigate  = useNavigate()

    interface TextArg {
        text: string
    }
    const FlexLink = (item: TextArg) => {
        let titled = item.text.charAt(0).toUpperCase() + item.text.slice(1)
        return (<>
                <Link 
                    as={ReachLink} 
                    to={`/${item.text}`} 
                    id={`link-${item.text}`} 
                >
                    <Text 
                        as='b'
                    >
                        {titled}
                    </Text>
                </Link>
        </>)
    }
    interface TimeOutput{
        minutes: number,
        seconds: number
    }
    const timeOutput = ({ minutes, seconds,}: TimeOutput) => {
        return `Admin (${timePadding(minutes)}:${timePadding(seconds)})`
    }
   
    useEffect(() => {
        const constructGrid = () => {
            if(sessionStatus === SessionStatus.Valid){
                setValidItems(["alarms", "devices", 'user'])
            } else {
                setValidItems(["login", "register",'server', "about"])        
            }
        }
        constructGrid()
    },[sessionStatus])

    
    useEffect(()=> {
        const adminTimeOut = () =>{
            setShowAdmin(false)
            if(window.location.pathname === '/admin'){
                navigate('/alarms')
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
 
    return (<>
        <HStack 
            mt="5px" 
            mb="5px" 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            background="radial-gradient(circle, rgba(52,124,228,0.5704482476584384) 0%, rgba(157,182,225,0) 100%)"
        >
            <Text>
                Untamo
            </Text>
            { validItems.includes('login') && <>
                <Spacer/>
                <FlexLink 
                    text='login' 
                    key={'navGrid-login'}
                />
            </>}
            {validItems.includes('register') && <>
                <Spacer/>
                <FlexLink 
                    text='register' 
                    key={'navGrid-register'}
                />
            </>}
            {validItems.includes('alarms') && <>
                <Spacer/>
                <FlexLink 
                    text='alarms' 
                    key={'navGrid-alarms'}
                />
            </>}
            {validItems.includes('devices') && <>
                <Spacer/>
                <div>
                    <Link 
                        key="deviceMenu-link"
                        onClick={()=> setShowDeviceMenu(!showDeviceMenu, "link-DeviceMenu", MenuType.Menu)}
                    >   
                        <Text 
                            as="b"
                            id="link-DeviceMenu"
                        >
                            Devices
                        </Text>

                    </Link>
                </div>
            </>}
            {validItems.includes('server') && <>
                <Spacer/>
                <Link
                    onClick={()=> setShowServerEdit(true)}
                >
                    <Text as='b'>
                        Server Location
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
                        onClick={()=> setShowUserMenu(!showUserMenu, "avatar-button", MenuType.Menu)}
                    />
                </div>
            </>}
                <Spacer/>
                </HStack>
            </>
            )
    
}

export default NavGrid