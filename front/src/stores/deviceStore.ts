//<DeviceContext.Provider value={{ currentDevice, setCurrentDevice, devices, setDevices, viewableDevices, setViewableDevices }}>
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DeviceType}  from '../type'
import axios from "axios"
import { notification, Status } from '../components/notification'
import { getCommunicationInfo, useAlarms } from "../stores"

interface Device {
    id: string,
    deviceName: string,
    type: DeviceType
}

type UseDevices = {
    devices: Array<Device>,
    viewableDevices: Array<string>,
    currentDevice: string| null,
    toEdit: Device| null,
    toDelete: Device| null,
    setToEdit: (d:Device|null) => void,
    setToDelete: (d:Device|null) => void,
    editDevice: (id: string, name: string, type: DeviceType) => void,
    deleteDevice: (id:string) => void,
    fetchDevices: () => void,
    setViewableDevices: (ids: Array<string>) => void, 
    toggleViewableDevices:(id:string) => void,
    setCurrentDevice: (id:string) => void,
    addDevice: (deviceName: string, type: DeviceType) => void,
    clear: () => void,
}
const useDevices = create<UseDevices>()(
    persist(
      (set) => (
            {
                devices: [],
                viewableDevices: [],
                currentDevice: null,
                toEdit: null,
                toDelete: null,
                setToEdit: (d) => set(
                    {
                        toEdit: d
                    }
                ),
                setToDelete: (d) => set(
                    {
                        toDelete: d
                    }
                ),
                editDevice: async(id, name, type) => {
                    await deviceEdit(id, name, type)
                },
                deleteDevice: async(id) => {
                    await deleteDevice(id)
                },
                fetchDevices: async() => {
                    await fetchDevices()
                },
                setViewableDevices: (ids) => set (
                    state => (
                            {
                                viewableDevices: state.devices.filter(device => ids.includes(device.id) === true).map(device => device.id)
                            }
                    )
                ),
                toggleViewableDevices: (id) => set(
                    state =>(
                        {
                            viewableDevices: toggleViewableDevices(id, state.viewableDevices)
                        }
                    )
                ),
                setCurrentDevice: (id) => {
                    useAlarms.getState().setReloadAlarmList()
                    useAlarms.getState()
                    set (
                        state => (
                            {
                                currentDevice: state.devices.filter(device => device.id  ===id).map(device => device.id)[0]
                            }
                        )
                    )
                },
                addDevice: async (name, type) => {
                    addDevice(name, type)
                },
                clear: () => set(
                    {
                        devices: [] as Array<Device>,
                        viewableDevices: [] as Array<string>,
                        currentDevice: null,
                    }
                ),
            }
        ),

        {
            name: 'devices', 
            storage: createJSONStorage(() => localStorage), 
            partialize: (state) => (
                { 
                    devices: state.devices,
                    viewableDevices: state.viewableDevices,
                    currentDevice: state.currentDevice
                }
            ),
        }
    )
)
const addDevice = async (name: string, type: DeviceType)=> {
    const { server, token } = getCommunicationInfo()
    const devices = useDevices.getState().devices
    let deviceSameName = devices.filter(device => device.deviceName === name)
    if(name.length < 1 || deviceSameName.length >0){
        notification("Device", "Name taken or too short", Status.Error)
        return
    }
    
    try{
        let res = await axios.post(`${server}/api/device`, 
                                    {
                                        deviceName: name, 
                                        type: type
                                    }, 
                                    {
                                    headers: 
                                        {
                                            token: token
                                        }
                                    }
                                )
    
        interface Resp{
            id: string,
            type: DeviceType,
            device: string
        }

        let deviceData: Resp = res.data
        let newDevice : Device= {
                                    id:deviceData.id, 
                                    type: deviceData.type, 
                                    deviceName: deviceData.device
                                }
        if(newDevice.deviceName !== name && newDevice.type !== type){
            return
        }
        if(devices.length === 0){
            useDevices.setState({ currentDevice: newDevice.id})
        }
        //console.log([...devices, newDevice])
        useDevices.setState({ devices: [...devices, newDevice]})
        let viewableDevices = useDevices.getState().viewableDevices
        viewableDevices = [...viewableDevices, newDevice.id]
        useDevices.setState({ viewableDevices: viewableDevices})

        notification("Device", "A new device was added")
    }catch(err){
        notification("Device", "Failed to add a device", Status.Error)
    }
}

const fetchDevices = async () => {
    const { server, token } = getCommunicationInfo()
    let fetchedDevices = [] as Array<Device>
    try{
        let res = await axios.get(`${server}/api/devices`,
            {
                headers: 
                    {
                        token: token
                    }
            }
        )
        let devices = res.data as Array<Device>
        //console.log(devices)
        useDevices.setState(
            {
                devices: devices
            }
        )
        let viewableDevices = useDevices.getState().viewableDevices
        if(viewableDevices.length === 0){
            let currentDevice = useDevices.getState().currentDevice
            if(!currentDevice){
                useDevices.setState({viewableDevices :[...devices.map(device => device.id)]}) 
            }
        }
    }catch(err:any){
        notification("Devices", "Couldn't fetch the device list", Status.Error)
    }
}

const deviceEdit = async (id: string , name: string, type: DeviceType) => {
    const { server, token } = getCommunicationInfo()
    const editDevice : Device =  {
                                    id: id,
                                    deviceName: name,
                                    type: type
                                  }
    const devices = useDevices.getState().devices
    if(editDevice){
      let deviceObject = devices.filter(device => device.id === editDevice.id)
      if(deviceObject.length !== 1){
        notification("Device", "Unknown device", Status.Error)
        return 
      }
      if(editDevice.deviceName.length <1) {
        notification("Device", "Name too short", Status.Error)
        return 
      }
      let deviceMatchName = devices.filter(device => device.deviceName === editDevice.deviceName)
      if(deviceMatchName.length > 1){
        notification("Device", "Name taken", Status.Error)
        return 
      }
      if((deviceMatchName.length === 1) && (deviceMatchName[0].deviceName !== editDevice.deviceName)){
        notification("Device", "Name taken", Status.Error)
        return 
      }

      try{
        let res = await axios.put(`${server}/api/device/`+ editDevice.id,
                                        {
                                            deviceName: editDevice.deviceName, 
                                            type: editDevice.type, 
                                            id: editDevice.id 
                                        }, 
                                        {
                                            headers: 
                                                        {
                                                            token: token
                                                        }
                                        }
                                    )
        let devicesFiltered = devices.filter(device => device.id !== editDevice.id)            
        notification("Device", "A device was updated")

        useDevices.setState(
                                { 
                                    devices: [...devicesFiltered, editDevice],
                                    toEdit: null
                                }
                            )
            
    }catch(err){
        notification("Device", "Failed to update a device", Status.Error)
    }
    }
}

const deleteDevice = async (id: string ) => {
    const { server, token } = getCommunicationInfo()
    
    const devices = useDevices.getState().devices
    const deleteDevices = devices.filter(device => device.id === id)

    if(deleteDevices.length !== 1){
        return 
    }
    const deleteDevice = deleteDevices[0]
    try {
        let res = await axios.delete( `${server}/api/device/` + deleteDevice.id, 
                                        {
                                            headers: 
                                                        {
                                                            token: token
                                                        }
                                        } 
                                    )
        //console.log(res.data)
        const currentDevice = useDevices.getState().currentDevice
        if(currentDevice === deleteDevice.id){
            useDevices.setState(
                {
                    currentDevice: null
                }
            )
        }
        const viewableDevices = useDevices.getState().viewableDevices
        if (viewableDevices.includes(deleteDevice.id)){
          let viewableDevicesFiltered = viewableDevices.filter(device => device !== deleteDevice.id)
          useDevices.setState(
            {
                viewableDevices: viewableDevicesFiltered
            }
          )
        }
 
        useDevices.setState(
                                { 
                                    devices: devices.filter(device => device.id !== deleteDevice.id),
                                    toDelete: null
                                
                                }
                            ) 
    }catch(err){
        //console.log(err)
        notification("Device", "Can not delete device", Status.Error)
    }
}

const toggleViewableDevices = (id:string, viewableDevices: Array<string>) => {
    if(viewableDevices.includes(id)){
        return [ ...viewableDevices.filter(DId => DId !== id)]
    }
    return [...viewableDevices, id]
}
export default useDevices