import { Link as ReachLink } from 'react-router-dom'
import { Text, Link, Spacer, HStack, Avatar, Flex, Box, Image, Icon, IconProps } from '@chakra-ui/react'
import React, { useState, useEffect, useLayoutEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { useSettings, useLogIn, useAdmin, useTimeouts, usePopups, extend, useAlarms, useAudio } from '../stores'
import { SessionStatus } from '../type'
import { timePadding } from './Alarms/AlarmComponents/stringifyDate-Time'
import Countdown from "react-countdown"
import { BsFillPlayFill as PlayIcon } from 'react-icons/bs'
import { ChevronDownIcon as Down, ChevronUpIcon as Up} from  '@chakra-ui/icons'
import sleep from './sleep'
import './../App.css'
import { IconType } from 'react-icons'

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
    const setShowAdminPop = usePopups((state)=> state.setShowAdminPop)
    const showAdminPop = usePopups((state)=> state.showAdminPop)
    const setShowAlarmPop = usePopups((state)=> state.setShowAlarmPop)
    const showAlarmPop = usePopups((state)=> state.showAlarmPop)
    const showUserMenu = usePopups((state)=> state.showUserMenu)
    const windowSize = usePopups((state)=> state.windowSize)
    const setWindowSize = usePopups((state)=> state.setWindowSize)
    const setNavigationTriggered = usePopups((state)=>state.setNavigationTriggered)
    const plays = useAudio((state)=> state.plays)
    const isMobile = usePopups((state)=> state.isMobile)
	const setShowSettings = usePopups((state)=> state.setShowSettings)
	const showSettings = usePopups((state)=> state.showSettings)
	const navBarTop = useSettings((state)=> state.navBarTop)
    const navHeight = useSettings((state)=> state.height)
    const [ validItems, setValidItems ] = useState(["login", "register", "about"])
    const [ showAdmin, setShowAdmin ] = useState(false)
    const [ pointing, setPointing ] = useState<any>(Down)
    
    const navigate  = useNavigate()
    useLayoutEffect(() => {
        function updateSize() {
            setWindowSize(window.innerWidth, window.innerHeight, [-90,90].includes(window.orientation))
            setNavigationTriggered()
        }
        window.addEventListener('resize', updateSize)
        updateSize()
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    const addressEndsWith = (end:string) => {
        return window.location.pathname.replaceAll("/","").endsWith(end)
    }


    interface TimeOutput{
        minutes: number,
        seconds: number
    }
    const timeOutput = ({ minutes, seconds,}: TimeOutput) => {
        return (<Text color={"red"} as ="b"> ({timePadding(minutes)}:{timePadding(seconds)}) {(addressEndsWith("admin"))?<Icon as={Down} />:""}</Text>)
    }

    useEffect(() => {
        const constructGrid = async() => {
            if(sessionStatus === SessionStatus.Valid){
                setValidItems(["alarms", "devices", 'user'])
                await sleep(5)
                setNavigationTriggered()
            } else {
                setValidItems(["register",'server', "about"])  
                await sleep(15)
                let isLogIn = window.location.pathname.replaceAll("/","").endsWith("login")
                if(!isLogIn){
                    setValidItems(["login",'server', "about"])
                    setNavigationTriggered() 
                }else{
                    setValidItems(["register",'server', "about"])
                    setNavigationTriggered()
                }  
            }
        }
        constructGrid()
    },[sessionStatus])

    useEffect(()=>{
        setNavigationTriggered()
        setPointing((navBarTop)?Down:Up)
    },[navBarTop])
    useEffect(()=> {
        const adminTimeOut = async() =>{
            setShowAdmin(false)
            await sleep(5)
            setNavigationTriggered()
            if(window.location.pathname === '/admin'){
                navigate(extend('/alarms'))
            }
        }
        try{
            clearAdminTimeout()
        }catch(err){}
        if(adminTime > Date.now()){
            setShowAdmin(true)
            setNavigationTriggered()
        }else{
            setShowAdmin(false)
            setNavigationTriggered()
        }
        let tID = setTimeout(adminTimeOut, adminTime - Date.now())
        setAdminTimeout(tID)
    },[adminTime, navigate])
 
    return (
            <Flex 
                display="flex"
                id="NavBar"
                alignItems="center"
                position="fixed"
                justifyContent="space-between"
                as="header"
                width={10}
                zIndex={500}
                alignContent={"left"}
                background="radial-gradient(circle, rgba(52,124,228,0.57044825) 50%, rgba(157,182,225,0) 100%)"
                style={{width:windowSize.width, left:0,right:windowSize.width, bottom: 0, top: (navBarTop)?0:windowSize.height- navHeight, height:navHeight }}

            >
                <HStack
                    ml="1%"
                    onClick={()=>setShowSettings(!showSettings)}
                >
                    <Image 
                        ml={"2px"}
                        src={logo}
                        height={"50px"}
                        className='LogoClock'
                        draggable="false"
                        pointerEvents={"none"}
                    />
                    {((isMobile && windowSize.landscape) ||  !isMobile ) && <Text>
                        Untamo
                    </Text>}
                </HStack>
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
                    <Link
                        key="alarms-link"
                        as={ReachLink} 
                        to={(!addressEndsWith("play-alarm"))?extend(`/alarms`):extend(`/play-alarm`)} 
                        id={`link-alarm`} 
                        onClick={()=>(addressEndsWith("alarms") )?setShowAlarmPop(!showAlarmPop):{}}
                    >
                        <Text as="b">
                            Alarms {(plays)?<Icon as={PlayIcon} />:""}{(addressEndsWith("alarms"))?<Icon as={pointing} />:""}
                        </Text>
                    </Link>
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
                        mr={"4%"}
                        onClick={()=>setShowAbout(true)}
                    >
                        <Text as='b' >
                            About
                        </Text>
                    </Link></>}
                {showAdmin && <>
                    <Spacer/>
                    <Link 
                        key="admin-link"
                        as={ReachLink} 
                        to={extend(`/admin`)} 
                        id={`link-admin`} 
                        onClick={()=>(addressEndsWith("admin") )?setShowAdminPop(!showAdminPop):{}}
                    >
                        <Text as="b" color={"red"}>
                            Admin 
                        </Text>
                        <Countdown  
                                date={adminTime}
                                renderer={timeOutput}
                        />
                    </Link>
                </>}
                {validItems.includes('user') && <>
                    <Spacer/>
                    <Box mr="4%">
                        <Link
                            as={Avatar} 
                            name={userInfo.screenName} 
                            size='sm'
                            id="avatar-button"
                            onClick={()=> setShowUserMenu(!showUserMenu)}
                        />
                    </Box>
                </>}
            </Flex>
        )
}

export default NavGrid