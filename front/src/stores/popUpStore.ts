import { create } from 'zustand'
import useFetchQR from './QRStore'
import useAlarm from '../components/Alarms/AlarmComponents/alarmStates'


export type WindowSize = {
    width: number,
    height: number
    landscape:boolean
}
type Popup = {
    showEditDevice: boolean,
    setShowEditDevice: (to: boolean) => void,
    showSettings: boolean,
    setShowSettings: (to: boolean) => void,
    showDeleteDevice: boolean,
    setShowDeleteDevice: (to: boolean) => void,
    showAlarmPop: boolean,
    setShowAlarmPop: (to: boolean) => void,
    showAdminPop: boolean,
    setShowAdminPop: (to: boolean) => void,
    showEditAlarm: boolean,
    setShowEditAlarm: (to: boolean) => void,
    showAddAlarm: boolean,
    setShowAddAlarm: (to: boolean) => void,   
    showDeleteAlarm: boolean,
    setShowDeleteAlarm: (to: boolean) => void,
    showAdminConfirm: boolean,
    setShowAdminConfirm: (to: boolean) => void,
    showAddDevice: boolean,
    setShowAddDevice: (to: boolean) => void,
    showQRDialog: boolean,
    setShowQRDialog: (to: boolean) => void,
    showLogOut: boolean,
    setShowLogOut: (to: boolean) => void,
    showEditProfile: boolean,
    setShowEditProfile: (to: boolean) => void,
    showAbout: boolean,
    setShowAbout: (to: boolean) => void,
    showAdminLogIn: boolean,
    setShowAdminLogIn: (to: boolean) => void,
    showServerEdit: boolean,
    setShowServerEdit: (to: boolean) => void,
    showUserMenu: boolean,
    setShowUserMenu: (show: boolean ) => void,
    showDeviceMenu: boolean,
    setShowDeviceMenu: (show: boolean) =>void,
    showToast: boolean,
    setShowToast: (to:boolean) => void
    showTimepicker: boolean,
    setShowTimepicker: (to:boolean) => void
    isMobile: boolean
    setMobile: (to: boolean) => void
    windowSize: WindowSize,
    setWindowSize: (width: number, height: number, landscape: boolean) => void
    navigationTriggered: number,
    setNavigationTriggered: () => void,
}

const usePopups = create<Popup>((set, get) => ({
        showEditDevice: false,
        setShowEditDevice: (to) => {
            if(to){
                usePopups.setState({showToast: false })
            }else{
                usePopups.setState({showToast: true })
            }
            set( 
                {
                    showEditDevice: to
                }
            )
        },
        showSettings: false,
        setShowSettings: (to: boolean) => {
            set(
                {
                    showSettings: to
                }
            )
        },
        showDeleteDevice: false,
        setShowDeleteDevice: (to) => {
            set( 
                {
                    showDeleteDevice: to
                }
            )
        },
        showAlarmPop: false,
        setShowAlarmPop: (to: boolean) => {
            set(
                {
                    showAlarmPop: to
                }
            )
        },
        showAdminPop: false,
        setShowAdminPop: (to: boolean) => {
            set(
                {
                    showAdminPop: to
                }
            )
        },
        showAddAlarm: false,
        setShowAddAlarm: (to) =>{
            if(to){
                useAlarm.getState().onAddOpen()
                usePopups.setState({showToast: false })
            }else{
                usePopups.setState({showToast: true })
            }
            set(
                    {
                        showAddAlarm: to
                    }
                )
        },
        showEditAlarm: false,
        setShowEditAlarm: (to) => {
            if(to){
                usePopups.setState({showToast: false })
            }else{
                usePopups.setState({showToast: true })
            }
            set( 
                {
                    showEditAlarm: to
                }
            )
        },
        showAdminConfirm: false,
        setShowAdminConfirm:(to) => set(
            {
                showAdminConfirm: to
            }
        ),
        showDeleteAlarm: false,
        setShowDeleteAlarm: (to) => {
            set( 
                {
                    showDeleteAlarm: to
                }
            )
        },
        showAddDevice: false,
        setShowAddDevice: (to) => {
            if(to){
                usePopups.setState({ showToast: false })
            }else{
                usePopups.setState({ showToast: true })
            }
            set( 
                {
                    showAddDevice: to
                }
            )
        },
        showQRDialog: false,
        setShowQRDialog: (to) => {
            if(to){
                useFetchQR.getState().setFetchQR(true)
            }else{
                useFetchQR.getState().setFetchQR(false)
            }
            set( 
                {
                    showQRDialog: to
                }
            )
        },
        showLogOut: false,
        setShowLogOut: (to) => {
            set( 
                {
                    showLogOut: to
                }
            )
        },
        showEditProfile: false,
        setShowEditProfile: (to) => {
            if(to){
                usePopups.setState({showToast: false })
            }else{
                usePopups.setState({showToast: true })
            }
            set( 
                {
                    showEditProfile: to
                }
            )
        },
        showAbout: false,
        setShowAbout: (to) => {
            set( 
                {
                    showAbout: to
                }
            )
        },
        showAdminLogIn: false,
        setShowAdminLogIn: (to) => {
            set( 
                {
                    showAdminLogIn: to
                }
            )
        },
        showServerEdit: false,
        setShowServerEdit: (to) => {
            set( 
                {
                    showServerEdit: to
                }
            )
        },
        showUserMenu: false,
        setShowUserMenu: (show) => {
            set(
                {
                    showUserMenu: show
                }
            )
        },
        showDeviceMenu: false,
        setShowDeviceMenu: (show ) => {
            set(
                    {
                        showDeviceMenu: show
                    }
                )
        },
        showToast: true,
        setShowToast: (to:boolean) => {
            set(
                    {
                        showToast: to
                    }
                )
        },
        showTimepicker: false,
        setShowTimepicker: (to:boolean) => {
            set(
                {
                    showTimepicker : to
                }
            )
        },
        isMobile: false,
        setMobile: (to: boolean) => {
            set(
                {
                    isMobile: to
                }
            )
        },
        windowSize: {width: window.screen.width, height: window.screen.height, landscape: [-90,90].includes(window.orientation)},
        setWindowSize: (width , height , landscape) => {
            set(
                { windowSize:
                                {
                                    width: width,
                                    height: height,
                                    landscape: landscape
                                }
                }
            )
        },
        navigationTriggered: 0,
        setNavigationTriggered:() =>{
            set (
                {
                    navigationTriggered: (get().navigationTriggered + 1 % 2)
                }
            )
        }
    }
))

export default usePopups
