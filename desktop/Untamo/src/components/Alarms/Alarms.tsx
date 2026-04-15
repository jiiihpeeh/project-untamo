import React, { useState, useRef, useEffect } from 'preact/compat'
import { timeForNextAlarm, dayContinuationDays, numberToWeekDay } from "./calcAlarmTime"
import {  useDevices, useAlarms, usePopups, useSettings,  useLogIn } from "../../stores"
import { Path, WeekDay } from "../../type"
import { Trash2 as DeleteIcon, Pencil as EditIcon } from '../../ui/icons'
import { Alarm, AlarmCases } from "../../type"
import AddAlarmButton from "./AddAlarmButton"
import { timeToNextAlarm } from "./calcAlarmTime"
import { timePadding, time24hToTime12h, capitalize } from '../../utils'
import { useShallow } from 'zustand/react/shallow'
import { timeToUnits } from './calcAlarmTime'
import { stringifyDateArr } from './AlarmComponents/stringifyDate-Time'

function Alarms() {
    const containerRef = useRef<HTMLDivElement>(null)
    const currentDevice = useDevices((state) => state.currentDevice)
    const cardColors = useSettings((state) => state.cardColors)
    const clock24 = useSettings((state) => state.clock24)
    const [devices, viewableDevices] = useDevices(useShallow(state => [state.devices, state.viewableDevices] as const))
    const [alarms, setToDelete, setToEdit, toggleActivity] = useAlarms(useShallow(state => [state.alarms, state.setAlarmToDelete, state.setAlarmToEdit, state.toggleActivity] as const))
    const [setShowEdit, setShowDelete, setShowAlarmPop, setShowAdminPop] = usePopups(useShallow((state) => [state.setShowEditAlarm, state.setShowDeleteAlarm, state.setShowAlarmPop, state.setShowAdminPop] as const))
    const [showTiming, setShowTiming] = useState("")
    const [showButtons, setShowButtons] = useState("")
    const isLight = useSettings((state) => state.isLight)
    const timeIntervalID = useRef<string | null>(null)
    const counterLaunched = useRef<boolean>(false)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    async function timeCounter() {
        if (timeIntervalID.current) {
            const timeMs = timeToNextAlarm(useAlarms.getState().alarms.filter(item => item.id === timeIntervalID.current)[0])
            const time = timeToUnits(Math.round(timeMs / 1000))
            setShowTiming(` (${time.days} days ${timePadding(time.hours)}:${timePadding(time.minutes)}:${timePadding(time.seconds)})`)
            setTimeout(() => timeCounter(), 500)
        }
    }
    useEffect(() => {
        if (!counterLaunched.current) {
            timeCounter()
            counterLaunched.current = true
        }
    }, [showButtons])

    useEffect(() => {
        if( !currentDevice){
            setNavigateTo(Path.Welcome)
        }
    },[currentDevice])

    function renderCards() {
        let viewableAlarmsSet = new Set<Alarm>()
        let timeAlarmMap = new Map<number, Set<string>>()
        for (const filtrate of viewableDevices) {
            for (const secondFiltrate of alarms.filter(alarm => alarm.devices.includes(filtrate))) {
                viewableAlarmsSet.add(secondFiltrate)
                let timeStamp: number | null
                try {
                    timeStamp = timeForNextAlarm(secondFiltrate).getTime()
                } catch (err) {
                    timeStamp = null
                }
                if (timeStamp && secondFiltrate) {
                    let alarmMapStamp = timeAlarmMap.get(timeStamp)
                    if (alarmMapStamp) {
                        timeAlarmMap.set(timeStamp, alarmMapStamp.add(secondFiltrate.id))
                    } else {
                        timeAlarmMap.set(timeStamp, new Set([secondFiltrate.id]))
                    }
                }
            }
        }
        let viewableAlarms = [...viewableAlarmsSet]
        let timeMapArray = [...timeAlarmMap.keys()].sort(function (a, b) { return a - b })
        let sortedView: Array<Alarm> = []
        for (const item of timeMapArray) {
            let timeAlarmMapItem = timeAlarmMap.get(item)
            if (timeAlarmMapItem) {
                for (const subitem of timeAlarmMapItem) {
                    let filtration = viewableAlarms.filter(alarm => alarm.id === subitem)[0]
                    if (filtration) {
                        sortedView.push(filtration)
                    }
                }
            }
        }

        function occurrenceInfo(occurrence: AlarmCases, weekdays: number, date: [number, number,number]) {
            switch (occurrence) {
                case AlarmCases.Weekly:
                    return (
                        <div>
                            <div className="text-xs font-semibold uppercase">Weekdays</div>
                            <div className="pt-1 text-sm">{weekdayDisplay(weekdays, date)}</div>
                        </div>)
                case AlarmCases.Once:
                    return (
                        <div>
                            <div className="text-xs font-semibold uppercase">Date</div>
                            <div className="pt-1 text-sm">{`${stringifyDateArr(date)} ${weekdayDisplay(weekdays, date)}`}</div>
                        </div>
                    )
                case AlarmCases.Daily:
                    return (
                        <div>
                            <div className="text-xs font-semibold uppercase">Weekdays</div>
                            <div className="pt-1 text-sm">{weekdayDisplay(127, date)}</div>
                        </div>
                    )
                case AlarmCases.Yearly:
                    return (
                        <div>
                            <div className="text-xs font-semibold uppercase">Date</div>
                            <div className="pt-1 text-sm">{`${stringifyDateArr(date)} ${weekdayDisplay(weekdays, date)}`}</div>
                        </div>
                    )
            }
        }
        function getTime(time: [number, number]) {
            if (!clock24) {
                const fmt = time24hToTime12h(time)
                return (
                    <span className="flex items-baseline gap-1">
                        <span>{`${timePadding(fmt.time[0])}:${timePadding(fmt.time[1])}`}</span>
                        <span className="text-sm">{fmt['12h']}</span>
                    </span>
                )
            }
            return <span>{`${timePadding(time[0])}:${timePadding(time[1])}`}</span>
        }
        return sortedView.map(({ id, occurrence, time, weekdays, date, label, devices, active }, key) => {
            const bg = !active ? cardColors.inactive : (key % 2 === 0 ? cardColors.odd : cardColors.even)
            return (
                <div
                    key={key}
                    className="card shadow-sm mb-1 cursor-pointer"
                    style={{ backgroundColor: bg }}
                    id={`alarmCardContainer-${key}`}
                    onMouseDown={e => e.preventDefault()}
                    onMouseLeave={() => { setShowButtons(""); timeIntervalID.current = null }}
                    onMouseEnter={() => {
                        counterLaunched.current = false
                        setShowButtons(id)
                        timeIntervalID.current = id
                        setTimeout(() => {
                            if (timeIntervalID.current) { setShowAlarmPop(false); setShowAdminPop(false) }
                        }, 250)
                    }}
                >
                    <div className="card-body p-2">
                        <div className="text-sm">
                            {`${capitalize(occurrence)}: `}<strong>{label}</strong>
                            {showButtons === id && <span className="text-xs ml-1 opacity-70">{showTiming}</span>}
                        </div>
                        <div className="flex items-center justify-around gap-2 flex-wrap">
                            <div className="text-2xl font-bold uppercase">{getTime(time)}</div>
                            <div>
                                <div className="text-xs font-semibold uppercase">Devices</div>
                                <div className="text-sm pt-1">{mapDeviceIDsToNames(devices)}</div>
                            </div>
                            {occurrenceInfo(occurrence, weekdays, date)}
                        </div>
                        {showButtons === id && (
                            <div className="flex items-center justify-around mt-2 pt-2 border-t border-black/10">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-semibold uppercase">Edit</span>
                                    <button key={`edit-${key}`} className="btn btn-xs btn-warning"
                                        onClick={() => { setToEdit(id); setShowEdit(true) }}>
                                        <EditIcon size={12} />
                                    </button>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-semibold uppercase">Active</span>
                                    <input type="checkbox" className="toggle toggle-sm"
                                        name={`alarm-switch-${key}`}
                                        checked={active}
                                        onChange={() => { toggleActivity(id); setShowEdit(false) }} />
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-semibold uppercase">Delete</span>
                                    <button key={`delete-${id}-${key}`} className="btn btn-xs btn-error"
                                        onClick={() => { setShowEdit(false); setToDelete(id); setShowDelete(true) }}>
                                        <DeleteIcon size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        })
    }

    function mapDeviceIDsToNames(deviceIDs: Array<string>) {
        let filteredDevices = devices.filter(device => deviceIDs.includes(device.id))
        let filteredDeviceNames: Array<string> = []
        for (const dev of filteredDevices) {
            filteredDeviceNames.push(dev.deviceName)
        }
        return filteredDeviceNames.join(", ")
    }

    function weekdayDisplay(days: number, date: [number, number,number]) {
        let dayArr = dayContinuationDays(days)
        let subList: Array<string> = []
        for (const outer of dayArr) {
            subList.push(outer.join('-'))
        }
        let daysFormat = subList.join(', ')
        if (daysFormat.length === 0) {
            if (date.length > 0) {
                let formedDate = new Date()
                formedDate.setFullYear(date[0])
                formedDate.setMonth(date[1]-1)
                formedDate.setDate(date[2])
                daysFormat = `${numberToWeekDay(formedDate.getDay())}`
            }
        }
        return daysFormat
    }
    
    useEffect(() => {
        if (!currentDevice) {
            setNavigateTo(Path.Welcome)
        }
    }, [currentDevice])
    return (
        <>
            <div
                id={`alarmCardContainer`}
                ref={containerRef}
                className="mx-auto w-full max-w-[80%] px-4"
            >
                {renderCards()}
            </div>
            <AddAlarmButton
                mounting={containerRef} />
        </>
    )
}

export default Alarms