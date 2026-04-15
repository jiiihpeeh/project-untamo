import { useEffect, useRef, useState } from "preact/hooks"
import { useLogIn, useDevices } from "../stores"
import { useSettings, usePopups } from "../stores"
import { dialogSizes as sizes } from "../stores/settingsStore"
import { ChevronDown as ChevronDownIcon } from '../ui/icons'
import { SessionStatus, Path } from "../type"
import DeviceIcons from "./Device/DeviceIcons"
import OptionsToRadio from "./OptionsToRadio"

function Welcome() {
    const userInfo = useLogIn((state) => state.user)
    const devices = useDevices((state) => state.devices)
    const setCurrentDevice = useDevices((state) => state.setCurrentDevice)
    const currentDevice = useDevices((state) => state.currentDevice)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const setShowAddDevice = usePopups(state => state.setShowAddDevice)
    const menuRef = useRef<HTMLButtonElement>(null)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)
    const clock24 = useSettings((state) => state.clock24)
    const setClock24 = useSettings((state) => state.setClock24)
    const size = useSettings((state) => state.dialogSize)
    const [deviceMenuOpen, setDeviceMenuOpen] = useState(false)

    function TimeFormatSelect() {
        return (
            <div className="flex items-center justify-center">
                <div style={{ margin: "20px" }}>
                    <div className="flex-1" />
                    <b>Time Format</b>
                    <div className="flex flex-col gap-3">
                        <OptionsToRadio
                            options={{ "24 h": true, "12 h": false }}
                            selectedOption={clock24}
                            setOption={setClock24}
                            capitalizeOption={true}
                            sizeKey={sizes.get(size) as string}
                        />
                    </div>
                </div>
            </div>
        )
    }

    function menuDevices() {
        return devices.map((device) => {
            return (
                <li key={`menu-device-${device.id}`}>
                    <a
                        onClick={() => {
                            setCurrentDevice(device.id)
                            setDeviceMenuOpen(false)
                        }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-center">{device.deviceName}</span>
                        <DeviceIcons device={device.type} />
                    </a>
                </li>
            )
        })
    }

    function DeviceLayout() {
        if (!devices || devices.length === 0) {
            return (
                <div className="flex flex-col items-center gap-3">
                    <button
                        className="btn btn-success"
                        onClick={() => setShowAddDevice(true)}
                        id="add-device-button"
                        style={{ width: "50%" }}
                    >
                        Add a device
                    </button>
                </div>
            )
        } else {
            return (
                <div className="flex flex-col items-center gap-3" style={{ margin: "20px" }}>
                    <div className="dropdown w-3/5">
                        <button
                            ref={menuRef}
                            type="button"
                            className="btn btn-outline w-full flex justify-between items-center"
                            onClick={() => setDeviceMenuOpen(!deviceMenuOpen)}
                        >
                            <span>Select a Device</span>
                            <ChevronDownIcon size={16} />
                        </button>
                        {deviceMenuOpen && (
                            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
                                {menuDevices()}
                            </ul>
                        )}
                    </div>
                    <span>or</span>
                    <button
                        className="btn btn-success"
                        onClick={() => setShowAddDevice(true)}
                        id="add-device-button"
                        style={{ width: "60%" }}
                    >
                        Add a device
                    </button>
                </div>
            )
        }
    }

    useEffect(() => {
        if (sessionStatus === SessionStatus.NotValid) {
            setNavigateTo(Path.LogIn)
        }
    }, [sessionStatus])

    useEffect(() =>{
        if(currentDevice){
            setNavigateTo(Path.Alarms)
        }
    },[])

    return (
        <>{(userInfo.screenName.length > 0) ?
            <h2 className="text-lg font-bold" style={{ textShadow: "xl", margin: "2%" }}>
                Welcome, <b>{userInfo.screenName}</b>!
            </h2> : ''}
            <div className="divider my-1" />
            <div className="flex-1" />
            <TimeFormatSelect />
            <div className="divider my-1" />
            <div className="flex-1" />
            <DeviceLayout />
        </>
    )
}

export default Welcome
