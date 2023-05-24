import { Link as ReachLink } from 'react-router-dom'
import { Text, Link, Spacer, HStack, Avatar, Flex, Image, Icon  } from '@chakra-ui/react'
import React, { useState, useEffect, useLayoutEffect } from "react"
import { useSettings, useLogIn, useAdmin, useTimeouts,
         usePopups, extend, useAlarms, useAudio, useDevices } from '../stores'
import { SessionStatus, Path } from '../type'
import Countdown from "react-countdown"
import { BsFillPlayFill as PlayIcon } from 'react-icons/bs'
import { ChevronDownIcon as Down, ChevronUpIcon as Up} from  '@chakra-ui/icons'
import { urlEnds,  sleep, timePadding } from '../utils'
import './../App.css'

function NavGrid() {
    const logo = useAlarms((state) => state.logo)
    const adminTime = useAdmin((state) => state.time)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const userInfo = useLogIn((state) => state.user)
    const currentDevice = useDevices((state) => state.currentDevice)
    const setShowAbout = usePopups((state) => state.setShowAbout)
    const setShowServerEdit = usePopups((state) => state.setShowServerEdit)
    const clearAdminTimeout = useTimeouts((state) => state.clearAdminTimeout)
    const setAdminTimeout = useTimeouts((state) => state.setAdminID)
    const setShowUserMenu = usePopups((state) => state.setShowUserMenu)
    const setShowDeviceMenu = usePopups((state) => state.setShowDeviceMenu)
    const showDeviceMenu = usePopups((state) => state.showDeviceMenu)
    const setShowAdminPop = usePopups((state) => state.setShowAdminPop)
    const showAdminPop = usePopups((state) => state.showAdminPop)
    const setShowAlarmPop = usePopups((state) => state.setShowAlarmPop)
    const showAlarmPop = usePopups((state) => state.showAlarmPop)
    const showUserMenu = usePopups((state) => state.showUserMenu)
    const windowSize = usePopups((state) => state.windowSize)
    const setWindowSize = usePopups((state) => state.setWindowSize)
    const setNavigationTriggered = usePopups((state) => state.setNavigationTriggered)
    const plays = useAudio((state) => state.plays)
    const isMobile = usePopups((state) => state.isMobile)
    const setShowSettings = usePopups((state) => state.setShowSettings)
    const showSettings = usePopups((state) => state.showSettings)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navHeight = useSettings((state) => state.height)
    const [validItems, setValidItems] = useState(["login", "register", "about"])
    const [showAdmin, setShowAdmin] = useState(false)
    const [pointing, setPointing] = useState<typeof Down>(Down)
    const [avatarSize, setAvatarSize] = useState("md")
    const [logoAnimate, setLogoAnimate] = useState<string | undefined>(undefined)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    useLayoutEffect(() => {
        function updateSize() {
            setWindowSize(window.innerWidth, window.innerHeight, [-90, 90].includes(window.orientation))
            setNavigationTriggered()
        }
        window.addEventListener('resize', updateSize)
        updateSize()
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    interface TimeOutput {
        minutes: number
        seconds: number
    }
    function timeOutput({ minutes, seconds, }: TimeOutput) {
        return (<Text
                    color={"red"}
                    as="b"
                >
            ({timePadding(minutes)}:{timePadding(seconds)}) {(urlEnds(Path.Admin)) ? <Icon as={pointing} /> : ""}
        </Text>
        )
    }

    useEffect(() => {
        async function constructGrid() {
            await sleep(5)
            if (sessionStatus === SessionStatus.Valid ) {
                setValidItems(["alarms", "devices", 'user'])
                await sleep(5)
            } else if (sessionStatus === SessionStatus.Activate) {
                setValidItems(["user"])
                await sleep(5)
            } else {
                setValidItems(["register", 'server', "about"])
                await sleep(15)
                let isLogIn = urlEnds(Path.LogIn)
                if (!isLogIn) {
                    setValidItems(["login", 'server', "about"])
                } else {
                    setValidItems(["register", 'server', "about"])
                }
            }
        }
        constructGrid()
    }, [sessionStatus])

    useEffect(() => {
        setNavigationTriggered()
        setPointing((navBarTop) ? Down : Up)
    }, [navBarTop])
    useEffect(() => {
        setNavigationTriggered()
    }, [showAdmin, validItems])
    useEffect(() => {
        const adminTimeOut = async () => {
            setShowAdmin(false)
            await sleep(5)
            setNavigationTriggered()
            if (urlEnds(Path.Admin)) {
                setNavigateTo(Path.Alarms)
            }
        }
        try {
            clearAdminTimeout()
        } catch (err) { }
        if (adminTime > Date.now()) {
            setShowAdmin(true)
            setNavigationTriggered()
        } else {
            setShowAdmin(false)
            setNavigationTriggered()
        }
        let tID = setTimeout(adminTimeOut, adminTime - Date.now())
        setAdminTimeout(tID)
    }, [adminTime])

    useEffect(() => {
        setNavigationTriggered()
        //"2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"
        if (navHeight < 30) {
            setAvatarSize("2xs")
        } if (navHeight < 35) {
            setAvatarSize("xs")
        } else if (navHeight < 51) {
            setAvatarSize("sm")
        } else if (navHeight < 68) {
            setAvatarSize("md")
        } else {
            setAvatarSize("lg")
        }
    },
        [navHeight])
    return (
        <Flex
            display="flex"
            id="NavBar"
            onMouseEnter={() => setLogoAnimate("LogoClock")}
            onMouseLeave={() => {
                setTimeout(() => {
                    setLogoAnimate(undefined)
                    }, 
                    2000)
                } 
            }
            onMouseDown={e => e.preventDefault()}
            alignItems="center"
            position="fixed"
            justifyContent="space-between"
            as="header"
            width={10}
            zIndex={500}
            alignContent={"left"}
            background="radial-gradient(circle, rgba(52,124,228,0.57044825) 50%, rgba(157,182,225,0) 100%)"
            style={{
                width: windowSize.width,
                left: 0,
                right: windowSize.width,
                bottom: 0,
                top: (navBarTop) ? 0 : windowSize.height - navHeight,
                height: navHeight
            }}
        >
            <HStack
                ml="1%"
                onClick={() => {
                    setShowSettings(!showSettings)
                    setLogoAnimate("LogoClock")
                    setTimeout(() => {
                        setLogoAnimate(undefined)
                    }, 2000)
                }}
                cursor={"pointer"}
                onMouseOver={() => {
                    setLogoAnimate("LogoClock")
                }}
                onMouseLeave={() => {
                    setTimeout(() => {
                        setLogoAnimate(undefined)
                    }, 2000)
                }}
                onTouchStart={() => {
                    setLogoAnimate("LogoClock")
                    setTimeout(() => {
                        setLogoAnimate(undefined)
                    }, 2000)
                }}
            >
                <Image
                    ml={"2px"}
                    src={logo}
                    height={navHeight * 0.98}
                    className={logoAnimate}
                    draggable="false"
                    pointerEvents={"none"} 
                />
                    {((isMobile && windowSize.landscape) || !isMobile) && 
                    <Text>
                        Untamo
                    </Text>}
            </HStack>
            {validItems.includes('login') && <>
                <Spacer />
                <Link
                    as={ReachLink}
                    to={extend(Path.LogIn)}
                    id={`link-login`}
                    onClick={() => 
                        setValidItems([...validItems, 'register'].filter(l => l !== 'login'))
                    }
                >
                    <Text
                        as='b'
                    >
                        LogIn
                    </Text>
                </Link>
            </>}
            {validItems.includes('register') && <>
                <Spacer />
                <Link
                    as={ReachLink}
                    to={extend(Path.Register)}
                    id={`link-register`}
                    onClick={() => 
                        setValidItems([...validItems, 'login'].filter(l => l !== 'register'))
                    }
                >
                    <Text
                        as='b'
                    >
                        Register
                    </Text>
                </Link>
            </>}
            {validItems.includes('alarms') && <>
                <Spacer />
                <Link
                    key="alarms-link"
                    as={ReachLink}
                    to={(!urlEnds(Path.PlayAlarm) && currentDevice) ? extend(Path.Alarms) : (!currentDevice) ? extend(Path.Welcome) : extend(Path.PlayAlarm)}
                    id={`link-alarm`}
                    onClick={() => 
                        (urlEnds(Path.Alarms)) ? setShowAlarmPop(!showAlarmPop) : {}
                    }
                >
                    <Text as="b">
                        Alarms {(plays) ? 
                        <Icon as={PlayIcon} /> : ""}{(urlEnds(Path.Alarms)) ? <Icon as={pointing} /> : ""}
                    </Text>
                </Link>
            </>}
            {validItems.includes('devices') && <>
                <Spacer />
                <Link
                    key="deviceMenu-link"
                    onClick={() => setShowDeviceMenu(!showDeviceMenu)}
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
                <Spacer />
                <Link
                    onClick={() => setShowServerEdit(true)}
                >
                    <Text as='b'>
                        {(isMobile) ? `Server` : `Server Location`}
                    </Text>
                </Link>
            </>}
            {validItems.includes('about') && <>
                <Spacer />
                <Link
                    mr={"4%"}
                    onClick={() => 
                        setShowAbout(true)
                    }
                >
                    <Text as='b'>
                        About
                    </Text>
                </Link></>}
            {showAdmin && <>
                <Spacer />
                <Link
                    key="admin-link"
                    as={ReachLink}
                    to={extend(Path.Admin)}
                    id={`link-admin`}
                    onClick={() => 
                        (urlEnds(Path.Admin)) ? setShowAdminPop(!showAdminPop) : {}
                    }
                >
                    <Text 
                        as="b" 
                        color={"red"}
                    >
                        Admin
                    </Text>
                    <Countdown
                        date={adminTime}
                        renderer={timeOutput} />
                </Link>
            </>}
            {validItems.includes('user') && <>
                <Spacer />
                <Avatar
                    name={userInfo.screenName}
                    size={avatarSize}
                    id="avatar-button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    cursor="pointer"
                    m={"3%"} 
                />
            </>}
        </Flex>
    )
}

export default NavGrid