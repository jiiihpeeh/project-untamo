import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { DeviceType, Device } from '../type'
import { notification, Status } from '../components/notification'
import { getCommunicationInfo, apiGet, apiPost, apiPut, apiDelete } from './api'
// circular import — safe: useStore only accessed inside function bodies after init
import { useStore } from './store'

export function uniqueDevices(devices: Array<Device>) {
    const unique: Array<Device> = []
    devices.forEach(d => {
        if (!unique.some(u => u.id === d.id)) unique.push(d)
    })
    return unique
}

function toggleViewableDevicesHelper(id: string, viewableDevices: Array<string>) {
    return viewableDevices.includes(id)
        ? [...viewableDevices.filter(v => v !== id)]
        : [...viewableDevices, id]
}

async function addDevice(name: string, type: DeviceType) {
    const devices = useStore.getState().devices
    if (name.length < 1 || devices.some(d => d.deviceName === name)) {
        notification("Device", "Name taken or too short", Status.Error)
        return
    }
    try {
        interface Resp { id: string; type: DeviceType; deviceName: string }
        const deviceData = await apiPost<Resp>('/api/device', { deviceName: name, type })
        const newDevice: Device = { id: deviceData.id, type: deviceData.type, deviceName: deviceData.deviceName }
        if (newDevice.deviceName !== name && newDevice.type !== type) return
        if (devices.length === 0) {
            useStore.setState({ currentDevice: newDevice.id })
        }
        useStore.setState({ devices: uniqueDevices([...devices, newDevice]) })
        const viewableDevices = useStore.getState().viewableDevices
        useStore.setState({ viewableDevices: [...viewableDevices, newDevice.id] })
        notification("Device", "A new device was added")
    } catch (err) {
        notification("Device", "Failed to add a device", Status.Error)
    }
}

async function fetchDevices() {
    const { token } = getCommunicationInfo()
    if (token.length < 3) return
    try {
        const devices = await apiGet<Array<Device>>('/api/devices')
        useStore.setState({ devices })
        const viewableDevices = useStore.getState().viewableDevices
        if (viewableDevices.length === 0 && !useStore.getState().currentDevice) {
            useStore.setState({ viewableDevices: devices.map(d => d.id) })
        }
    } catch {
        const state = useStore.getState()
        if (state.sessionValid !== undefined) {
            notification("Devices", "Couldn't fetch the device list", Status.Error)
        }
    }
}

async function deviceEdit(id: string, name: string, type: DeviceType) {
    const editDevice: Device = { id, deviceName: name, type }
    const devices = useStore.getState().devices
    if (!devices.some(d => d.id === editDevice.id)) {
        notification("Device", "Unknown device", Status.Error)
        return
    }
    if (editDevice.deviceName.length < 1) {
        notification("Device", "Name too short", Status.Error)
        return
    }
    const nameMatches = devices.filter(d => d.deviceName === editDevice.deviceName)
    if (nameMatches.length > 1 || (nameMatches.length === 1 && nameMatches[0].id !== editDevice.id)) {
        notification("Device", "Name taken", Status.Error)
        return
    }
    try {
        await apiPut(`/api/device/${editDevice.id}`, {
            deviceName: editDevice.deviceName,
            type:       editDevice.type,
            id:         editDevice.id,
        })
        const filtered = devices.filter(d => d.id !== editDevice.id)
        notification("Device", "A device was updated")
        useStore.setState({ devices: uniqueDevices([...filtered, editDevice]), deviceToEdit: null })
    } catch (err) {
        notification("Device", "Failed to update a device", Status.Error)
    }
}

async function deleteDevice(id: string) {
    const devices = useStore.getState().devices
    const target  = devices.find(d => d.id === id)
    if (!target) return
    try {
        await apiDelete(`/api/device/${target.id}`)
        if (useStore.getState().currentDevice === target.id) {
            useStore.setState({ currentDevice: null })
        }
        const viewableDevices = useStore.getState().viewableDevices
        if (viewableDevices.includes(target.id)) {
            useStore.setState({ viewableDevices: viewableDevices.filter(v => v !== target.id) })
        }
        useStore.setState({
            devices:      uniqueDevices(devices.filter(d => d.id !== target.id)),
            deviceToDelete: null,
        })
    } catch (err) {
        notification("Device", "Can not delete device", Status.Error)
    }
}

export interface DeviceSlice {
    devices:          Array<Device>
    viewableDevices:  Array<string>
    currentDevice:    string | null
    deviceToEdit:     Device | null
    deviceToDelete:   Device | null
    setDeviceToEdit:        (d: Device | null) => void
    setDeviceToDelete:      (d: Device | null) => void
    editDevice:             (id: string, name: string, type: DeviceType) => void
    deleteDevice:           (id: string) => void
    fetchDevices:           () => void
    setViewableDevices:     (ids: Array<string>) => void
    toggleViewableDevices:  (id: string) => void
    setCurrentDevice:       (id: string) => void
    addDevice:              (deviceName: string, type: DeviceType) => void
    clearDevices:           () => void
}

export const createDeviceSlice: StateCreator<BoundStore, [], [], DeviceSlice> = (set, get) => ({
    devices:        [],
    viewableDevices: [],
    currentDevice:  null,
    deviceToEdit:   null,
    deviceToDelete: null,

    setDeviceToEdit:   (d) => set({ deviceToEdit: d }),
    setDeviceToDelete: (d) => set({ deviceToDelete: d }),

    editDevice:  async (id, name, type) => { await deviceEdit(id, name, type) },
    deleteDevice: async (id) => { await deleteDevice(id) },
    fetchDevices: async () => { await fetchDevices() },

    setViewableDevices: (ids) => set(state => ({
        viewableDevices: state.devices.filter(d => ids.includes(d.id)).map(d => d.id)
    })),

    toggleViewableDevices: (id) => set(state => ({
        viewableDevices: toggleViewableDevicesHelper(id, state.viewableDevices)
    })),

    setCurrentDevice: (id) => {
        get().setReloadAlarmList()
        set(state => ({
            currentDevice: state.devices.find(d => d.id === id)?.id ?? null
        }))
    },

    addDevice: async (name, type) => { await addDevice(name, type) },

    clearDevices: () => set({
        devices:        [] as Array<Device>,
        viewableDevices: [] as Array<string>,
        currentDevice:  null,
    }),
})
