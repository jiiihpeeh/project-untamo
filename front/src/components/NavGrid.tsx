import React, { useState, useEffect, useLayoutEffect } from "react"
import { useSettings, useLogIn, useAdmin, useTimeouts,
         usePopups, extend, useAlarms, useAudio, useDevices } from '../stores'
import { SessionStatus, Path } from '../type'
import Countdown from "react-countdown"
import { Play as PlayIcon, ChevronDown as Down, ChevronUp as Up } from '../ui/icons'
import type { LucideIcon } from '../ui/icons'
import { urlEnds, sleep, timePadding } from '../utils'
import './../App.css'

// Avatar px per size key
const AVATAR_PX: Record<string, number> = {
    '2xs': 18, 'xs': 24, 'sm': 32, 'md': 40, 'lg': 48,
}

function initials(name: string): string {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function NavLink({ to, children, id, onClick, className = '' }: {
    to?: string
    children: any
    id?: string
    onClick?: () => void
    className?: string
}) {
    const handleClick = (e: MouseEvent) => {
        if (onClick) onClick()
        if (to) {
            e.preventDefault()
            window.history.pushState(null, '', to)
            window.dispatchEvent(new PopStateEvent('popstate'))
        }
    }
    return (
        <a
            href={to || '#'}
            id={id}
            className={`btn btn-ghost btn-sm font-bold ${className}`}
            onClick={handleClick}
        >
            {children}
        </a>
    )
}

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
    const showUserMenu = usePopups((state) => state.showUserMenu)
    const setShowDeviceMenu = usePopups((state) => state.setShowDeviceMenu)
    const showDeviceMenu = usePopups((state) => state.showDeviceMenu)
    const setShowAdminPop = usePopups((state) => state.setShowAdminPop)
    const showAdminPop = usePopups((state) => state.showAdminPop)
    const setShowAlarmPop = usePopups((state) => state.setShowAlarmPop)
    const showAlarmPop = usePopups((state) => state.showAlarmPop)
    const windowSize = usePopups((state) => state.windowSize)
    const setWindowSize = usePopups((state) => state.setWindowSize)
    const setNavigationTriggered = usePopups((state) => state.setNavigationTriggered)
    const plays = useAudio((state) => state.plays)
    const isMobile = usePopups((state) => state.isMobile)
    const setShowSettings = usePopups((state) => state.setShowSettings)
    const showSettings = usePopups((state) => state.showSettings)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navHeight = useSettings((state) => state.height)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    const [validItems, setValidItems] = useState(["login", "register", "about"])
    const [showAdmin, setShowAdmin] = useState(false)
    const [PointingIcon, setPointingIcon] = useState<LucideIcon>(() => Down)
    const [avatarSize, setAvatarSize] = useState("md")
    const [logoAnimate, setLogoAnimate] = useState<string | undefined>(undefined)

    useLayoutEffect(() => {
        function updateSize() {
            setWindowSize(window.innerWidth, window.innerHeight, [-90, 90].includes(window.orientation))
            setNavigationTriggered()
        }
        window.addEventListener('resize', updateSize)
        updateSize()
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    function timeOutput({ minutes, seconds }: { minutes: number; seconds: number }) {
        return (
            <span className="text-error font-bold">
                &nbsp;({timePadding(minutes)}:{timePadding(seconds)})
                {urlEnds(Path.Admin) && <PointingIcon size={13} className="inline ml-0.5 align-middle" />}
            </span>
        )
    }

    useEffect(() => {
        async function constructGrid() {
            await sleep(5)
            if (sessionStatus === SessionStatus.Valid) {
                setValidItems(["alarms", "devices", 'user'])
                await sleep(5)
            } else if (sessionStatus === SessionStatus.Activate) {
                setValidItems(["user"])
                await sleep(5)
            } else {
                setValidItems(["register", 'server', "about"])
                await sleep(15)
                const isLogIn = urlEnds(Path.LogIn)
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
        setPointingIcon(() => navBarTop ? Down : Up)
    }, [navBarTop])

    useEffect(() => {
        setNavigationTriggered()
    }, [showAdmin, validItems])

    useEffect(() => {
        const adminTimeOut = async () => {
            setShowAdmin(false)
            await sleep(5)
            setNavigationTriggered()
            if (urlEnds(Path.Admin)) setNavigateTo(Path.Alarms)
        }
        try { clearAdminTimeout() } catch (_) {}
        if (adminTime > Date.now()) {
            setShowAdmin(true)
            setNavigationTriggered()
        } else {
            setShowAdmin(false)
            setNavigationTriggered()
        }
        const tID = setTimeout(adminTimeOut, adminTime - Date.now())
        setAdminTimeout(tID)
    }, [adminTime])

    useEffect(() => {
        setNavigationTriggered()
        if      (navHeight < 30) setAvatarSize("2xs")
        else if (navHeight < 35) setAvatarSize("xs")
        else if (navHeight < 51) setAvatarSize("sm")
        else if (navHeight < 68) setAvatarSize("md")
        else                     setAvatarSize("lg")
    }, [navHeight])

    const showBrandText = (isMobile && windowSize.landscape) || !isMobile
    const alarmTarget = (!urlEnds(Path.PlayAlarm) && currentDevice)
        ? extend(Path.Alarms)
        : !currentDevice ? extend(Path.Welcome) : extend(Path.PlayAlarm)
    const avatarPx = AVATAR_PX[avatarSize] ?? 40

    return (
        <header
            id="NavBar"
            className="navbar px-2"
            onMouseDown={(e: MouseEvent) => e.preventDefault()}
            style={{
                position: 'fixed',
                left: 0,
                right: 0,
                top: navBarTop ? 0 : windowSize.height - navHeight,
                height: navHeight,
                minHeight: navHeight,
                zIndex: 500,
                background: 'radial-gradient(circle, rgba(52,124,228,0.57) 50%, rgba(157,182,225,0) 100%)',
                boxSizing: 'border-box',
            }}
        >
            {/* Brand / logo */}
            <div className="navbar-start">
                <button
                    className="btn btn-ghost gap-2 px-2"
                    style={{ height: navHeight, minHeight: navHeight }}
                    onClick={() => {
                        setShowSettings(!showSettings)
                        setLogoAnimate("LogoClock")
                        setTimeout(() => setLogoAnimate(undefined), 2000)
                    }}
                    onMouseOver={() => setLogoAnimate("LogoClock")}
                    onMouseLeave={() => setTimeout(() => setLogoAnimate(undefined), 2000)}
                    onTouchStart={() => {
                        setLogoAnimate("LogoClock")
                        setTimeout(() => setLogoAnimate(undefined), 2000)
                    }}
                >
                    <img
                        src={logo}
                        style={{ height: navHeight * 0.9, pointerEvents: 'none', display: 'block' }}
                        className={logoAnimate}
                        draggable={false}
                    />
                    {showBrandText && <span className="font-bold text-base">Untamo</span>}
                </button>
            </div>

            {/* Nav links + avatar */}
            <div className="navbar-end gap-1">
                {validItems.includes('login') && (
                    <NavLink
                        to={extend(Path.LogIn)}
                        id="link-login"
                        onClick={() => setValidItems([...validItems, 'register'].filter(l => l !== 'login'))}
                    >
                        LogIn
                    </NavLink>
                )}
                {validItems.includes('register') && (
                    <NavLink
                        to={extend(Path.Register)}
                        id="link-register"
                        onClick={() => setValidItems([...validItems, 'login'].filter(l => l !== 'register'))}
                    >
                        Register
                    </NavLink>
                )}
                {validItems.includes('alarms') && (
                    <NavLink
                        to={alarmTarget}
                        id="link-alarm"
                        onClick={() => { if (urlEnds(Path.Alarms)) setShowAlarmPop(!showAlarmPop) }}
                    >
                        Alarms
                        {plays && <PlayIcon size={13} className="ml-1 align-middle" />}
                        {urlEnds(Path.Alarms) && <PointingIcon size={13} className="ml-0.5 align-middle" />}
                    </NavLink>
                )}
                {validItems.includes('devices') && (
                    <NavLink
                        id="link-DeviceMenu"
                        onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                    >
                        Devices
                    </NavLink>
                )}
                {validItems.includes('server') && (
                    <NavLink onClick={() => setShowServerEdit(true)}>
                        {isMobile ? 'Server' : 'Server Location'}
                    </NavLink>
                )}
                {validItems.includes('about') && (
                    <NavLink onClick={() => setShowAbout(true)}>
                        About
                    </NavLink>
                )}
                {showAdmin && (
                    <NavLink
                        to={extend(Path.Admin)}
                        id="link-admin"
                        className="text-error"
                        onClick={() => { if (urlEnds(Path.Admin)) setShowAdminPop(!showAdminPop) }}
                    >
                        Admin
                        <Countdown date={adminTime} renderer={timeOutput} />
                    </NavLink>
                )}

                {/* User avatar */}
                {validItems.includes('user') && (
                    <div
                        className="avatar placeholder cursor-pointer ml-1"
                        id="avatar-button"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div
                            className="bg-primary text-primary-content rounded-full flex items-center justify-center font-bold"
                            style={{ width: avatarPx, height: avatarPx, fontSize: avatarPx * 0.4 }}
                        >
                            {initials(userInfo.screenName)}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}

export default NavGrid
