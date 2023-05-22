import { create } from 'zustand'
import { Device, DeviceType } from '../../type'
import  useDevices  from '../../stores/deviceStore'
type UseDeviceStates = {
    deviceName: string,
    type: DeviceType,
    id: string,
    setDeviceName: (name : string) => void,
    setType: (type: DeviceType) => void,
    setId: (id:string)=> void,
    reset: () => void,
    setDevice: (id : string, deviceName : string , type: DeviceType) => void,
    canEdit: boolean,
    checkEdit: ()=> void
    canAdd: boolean,
    checkAdd: ()=> void
}


const defaultDevice = {
    type: DeviceType.Phone,
    deviceName: "",
    id:""
}
const useDeviceState = create<UseDeviceStates>((set, get) => ({
    deviceName: "",
    setDeviceName: (to) => {
        set(
            {
                deviceName: to
            }
        )
        get().checkEdit()
        get().checkAdd()
    },
    type: DeviceType.Phone,
    setType: (to) => {
        set(
            {
                type: to
            }
        )
        get().checkEdit()
    },
    id: '',
    setId: (id:string)=> {
        set(
            {
                id: id
            }
        )
        get().checkEdit()
    },
    reset: ()=> set(
        {
            ...defaultDevice
        }
    ),
    setDevice: (id, deviceName, type) => {
        set(
            {
                id: id,
                deviceName: deviceName,
                type: type
            }
        )
        get().checkEdit()
    },
    canEdit: false,
    checkEdit: () => {
        const id = get().id
        const type = get().type
        const deviceName = get().deviceName
        const devices = useDevices.getState().devices
        if ((id.length === 0)|| (deviceName.length === 0)) {
            set(
                { 
                    canEdit: false 
                }
            )
            return
        }
        
        const deviceInfo = devices.filter(device=> id === device.id)[0]
        if(!deviceInfo ){
            set(
                { 
                    canEdit: false 
                }
            )
            return
        }
        
        const deviceNames = devices.filter(device=>deviceName === device.deviceName)
        if(deviceNames.length > 1){
            set(
                { 
                    canEdit: false 
                }
            )
            return
        }
        if(deviceNames.length === 1 ){
            if(id === deviceNames[0].id && type !== deviceNames[0].type){
                set(
                    { 
                        canEdit: true 
                    }
                )
                return
            }else{
                set(
                    { 
                        canEdit: false 
                    }
                )
                return
            }
        }
        set(
            { 
                canEdit: true 
            }
        )
    },
    canAdd: false,
    checkAdd: ()=> {
        const deviceName = get().deviceName
        const devices = useDevices.getState().devices
        if((deviceName.length ===0) || (devices.filter(device=> deviceName ===device.deviceName ).length > 0)){
            set(
                { 
                    canAdd: false
                }
            )
            return
        }
        set(
            { 
                canAdd: true
            }
        )
    },
}
))

export default useDeviceState