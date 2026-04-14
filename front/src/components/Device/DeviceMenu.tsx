import React from 'react'
import { useDevices, usePopups } from '../../stores'
import { Pencil as EditIcon, Trash2 as DeleteIcon } from '../../ui/icons'
import DeviceIcons from "./DeviceIcons"

function DeviceMenu() {
    const viewableDevices = useDevices((state) => state.viewableDevices)
    const toggleViewableDevices = useDevices((state) => state.toggleViewableDevices)
    const setShowDelete = usePopups((state) => state.setShowDeleteDevice)
    const setShowEdit = usePopups((state) => state.setShowEditDevice)
    const devices = useDevices((state) => state.devices)
    const setToDelete = useDevices((state) => state.setDeviceToDelete)
    const setCurrentDevice = useDevices((state) => state.setCurrentDevice)
    const currentDevice = useDevices((state) => state.currentDevice)
    const setToEdit = useDevices((state) => state.setDeviceToEdit)
    const setShowAddDevice = usePopups((state) => state.setShowAddDevice)
    const setShowDeviceMenu = usePopups((state) => state.setShowDeviceMenu)
    const showDeviceMenu = usePopups((state) => state.showDeviceMenu)
    const setShowQRDialog = usePopups((state) => state.setShowQRDialog)

    async function openDelete(id: string) {
        const dev = devices.find(d => d.id === id)
        if (dev) { setToDelete(dev); setShowDelete(true) }
    }
    async function openEdit(id: string) {
        const dev = devices.find(d => d.id === id)
        if (dev) { setToEdit(dev); setShowEdit(true) }
    }

    if (!showDeviceMenu) return null
    return (
        <div className="modal modal-open" style={{ zIndex: 1000 }}>
            <div className="modal-box">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => setShowDeviceMenu(false)}>✕</button>
                <h3 className="font-bold text-lg mb-4">Device Options</h3>
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Device</th>
                                <th className="text-center">Show</th>
                                <th className="text-center">Opt</th>
                                <th className="text-center">Edit</th>
                                <th className="text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map(deviceItem => (
                                <tr key={deviceItem.id}>
                                    <td>
                                        <span className="text-sm">
                                            {deviceItem.deviceName} <DeviceIcons device={deviceItem.type} />
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <input type="checkbox" className="checkbox checkbox-sm"
                                            checked={viewableDevices.includes(deviceItem.id)}
                                            onChange={() => toggleViewableDevices(deviceItem.id)} />
                                    </td>
                                    <td className="text-center">
                                        <input type="radio" className="radio radio-sm"
                                            checked={currentDevice === deviceItem.id}
                                            onChange={() => setCurrentDevice(deviceItem.id)} />
                                    </td>
                                    <td className="text-center">
                                        <div className="tooltip" data-tip="Edit device">
                                            <button className="btn btn-xs btn-ghost"
                                                onClick={() => openEdit(deviceItem.id)}>
                                                <EditIcon size={13} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="tooltip" data-tip="Delete device">
                                            <button className="btn btn-xs btn-ghost text-error"
                                                onClick={() => openDelete(deviceItem.id)}>
                                                <DeleteIcon size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <button className="btn btn-block" onClick={() => setShowQRDialog(true)}>
                        Pair a device (QR code)
                    </button>
                    <button id="add-device-button" className="btn btn-block" onClick={() => setShowAddDevice(true)}>
                        Add a device
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setShowDeviceMenu(false)} />
        </div>
    )
}

export default DeviceMenu
