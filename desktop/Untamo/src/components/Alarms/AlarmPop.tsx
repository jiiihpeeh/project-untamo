import {  Popover,  Button, Portal, PopoverContent, HStack,
    PopoverHeader, PopoverArrow, PopoverBody, PopoverAnchor, 
    PopoverFooter, Text, VStack, Box, Center } from '@chakra-ui/react'
import { useAudio,  useDevices, useAlarms, usePopups, useLogIn, useSettings } from '../../stores'
import { shallow } from 'zustand/shallow'
import { timePadding, time24hToTime12h } from '../../utils'
import { timeToUnits, timeForNextAlarm, timeToNextAlarm } from './calcAlarmTime'
import React, { useState, useEffect } from 'react'
import { ColorMode } from '../../type'

function AlarmPop() {
    const windowSize = usePopups((state) => state.windowSize)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navHeight = useSettings((state) => state.height)
    const clock24 = useSettings((state) => state.clock24)
    const colorMode = useSettings((state) => state.colorMode)
    const userInfo = useLogIn((state) => state.user)
    const plays = useAudio((state) => state.plays)
    const stop = useAudio((state) => state.stop)
    const [alarms, runAlarm, setToEdit, timeForNextLaunch, resetSnooze] = useAlarms(state => [state.alarms, state.runAlarm, state.setToEdit, state.timeForNextLaunch, state.resetSnooze], shallow)
    const currentDevice = useDevices(state => state.currentDevice)
    const devices = useDevices(state => state.devices)
    const [showAlarmPop, setShowAlarmPop, setShowEdit, navigationTriggered] = usePopups((state) => [state.showAlarmPop, state.setShowAlarmPop, state.setShowEditAlarm, state.navigationTriggered], shallow)
    const [noSnooze, setNoSnooze] = useState(true)
    const setShowAddAlarm = usePopups((state) => state.setShowAddAlarm)
    const [posStyle, setPosStyle] = useState<React.CSSProperties>({})

    function footerText() {
    let addBtn = (
        <Button
            onClick={() => setShowAddAlarm(true)}
            width="100%"
            backgroundColor={(colorMode === ColorMode.Light) ? "gray.400" : "#303f9f"}
        >
            Add an Alarm
        </Button>
    )
    if (!runAlarm || !currentDevice || !(runAlarm.devices).includes(currentDevice) || timeForNextLaunch < 0) {
        return (<Box>
            <Text
                alignContent={"center"}
                backgroundColor="black"
            >
                No alarms for this device
            </Text>
            {addBtn}
        </Box>)
    }
    const units = timeToUnits(timeForNextLaunch)
    if (units.days === 0) {
        if (units.hours === 0) {
            return (<Box>
                <Text
                    alignContent={"center"}
                >
                    Time left to next alarm: {timePadding(units.minutes)}:{timePadding(units.seconds)}
                </Text>
                {addBtn}
            </Box>)
        }
        return (<Box>
            <Text
                alignContent={"center"}
            >
                Time left to next alarm: {timePadding(units.hours)}:{timePadding(units.minutes)}
            </Text>{addBtn}
        </Box>)
    }
    return (<Box>
        <Text
            alignContent={"center"}
        >
            Time left to next alarm:  {units.days} days {timePadding(units.hours)}:{timePadding(units.minutes)}
        </Text>
        {addBtn}
    </Box>)
    }

    function timerInfo() {
    let postFix = ""
    let timeInfo = runAlarm?.time
    if (!clock24 && timeInfo) {
        let convertedTime = time24hToTime12h(timeInfo)
        timeInfo = convertedTime.time
        postFix = convertedTime['12h']
    }
    return (
        <VStack>
            <Text as="b">
                Coming Up: {(runAlarm) ? `${timeInfo}` : ""} {postFix}
            </Text>
            <HStack>
                {runAlarm && <Button
                    backgroundColor={(colorMode === ColorMode.Light) ? "gray.300" : "#1565c0"}
                    onClick={() => {
                        if (runAlarm) {
                            setToEdit(runAlarm.id)
                            setShowEdit(true)
                        }
                    } }
                >
                    Edit the Alarm
                </Button>}
                {(!noSnooze) && <Button
                    onClick={resetSnooze}
                >
                    Reset Snooze
                </Button>}
            </HStack>
        </VStack>
    )
    }
    function turnOff() {
    if (plays) {
        return (
            <Center>
                <Button
                    onClick={stop}
                    m={"3px"}
                >
                    Turn off Sound
                </Button>
            </Center>
        )
    } else {
        return (<></>)
    }
    }

    useEffect(() => {
    if (runAlarm) {
        let epochAlarm = timeToNextAlarm(runAlarm)
        let timeToAlarm = timeForNextAlarm(runAlarm).getTime() - Date.now()
        setNoSnooze(Math.abs(epochAlarm - timeToAlarm) < 20)
    }
    }, [runAlarm, alarms])
    useEffect(() => {
    let elem = document.getElementById("link-alarm")
    let navBar = document.getElementById("NavBar")
    if (elem && navBar) {
        let coords = elem.getBoundingClientRect()
        setPosStyle({ left: coords.left + coords.width / 2, top: (navBarTop) ? navHeight : windowSize.height - navHeight, position: "fixed" })
    }
    }, [navigationTriggered])

    function getCurrentDevice() {
    if (currentDevice) {
        let device = devices.filter(d => d.id === currentDevice)[0]
        return (device) ? device.deviceName : ""
    }
    return ""
    }
    return (
    <Popover
        isOpen={showAlarmPop}
        onClose={() => setShowAlarmPop(false)}
    >
        <PopoverAnchor>
            <Box style={posStyle} />
        </PopoverAnchor>
        <Portal>
            <PopoverContent
                onMouseDown={e => e.preventDefault()}
            >
                <PopoverArrow />
                <PopoverHeader>
                    <Center>
                        Alarms for {userInfo.screenName} on {getCurrentDevice()}
                    </Center>
                </PopoverHeader>
                {runAlarm &&
                    <PopoverBody
                        backgroundColor={(colorMode === ColorMode.Light) ? "blue.300" : "blackAlpha.500"}
                    >
                        {timerInfo()}
                        {turnOff()}
                    </PopoverBody>}
                <PopoverFooter
                    backgroundColor={(colorMode === ColorMode.Light) ? "gray.300" : "black.100"}
                >
                    {footerText()}
                </PopoverFooter>
            </PopoverContent>
        </Portal>
    </Popover>
    )
}

export default AlarmPop