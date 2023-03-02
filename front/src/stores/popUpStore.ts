import { create } from 'zustand'
import useFetchQR from './QRStore'
import useAlarm from '../components/Alarms/AlarmComponents/alarmStates'

export enum MenuType{
    Menu = "menu",
    SubMenu = "submenu"
}
export type MenuPlacer = {
    show: boolean,
    style: React.CSSProperties,
    element : HTMLElement | null 
    type: MenuType
}
type Popup = {
    showEditDevice: boolean,
    setShowEditDevice: (to: boolean) => void,
    showDeleteDevice: boolean,
    setShowDeleteDevice: (to: boolean) => void,
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
    showDeviceSelector: MenuPlacer,
    setShowDeviceSelector: (show: boolean, id: string, type: MenuType) => void,
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
    showUserMenu: MenuPlacer,
    setShowUserMenu: (show: boolean, id: string, type: MenuType) => void,
    showDeviceMenu: MenuPlacer,
    setShowDeviceMenu: (show: boolean, id: string, type: MenuType) => void,
    showToast: boolean,
    setShowToast: (to:boolean) => void
}
const menuDefault: MenuPlacer = {show:false, style: {}, element: null, type: MenuType.Menu}
const getOffset = (show: boolean, id: string, type: MenuType) => {
    const style:  React.CSSProperties = {
        top: "100px",
        left: "500px",
        position: "absolute"
    }
    let element  : HTMLElement | null = document.getElementById(id);
    //console.log(id)
    if(!element){
      return {
                show: show,
                style: style,
                element : element,
                type: type
             }   
    }
    const rect = element.getBoundingClientRect();
    //console.log(rect)
    if(type === MenuType.Menu){
        style.left = rect.left + window.scrollX
        style.top= rect.bottom + window.scrollY

    }else{
        style.left = rect.right + window.scrollX
        style.top= rect.bottom + window.scrollY
    }
    return  {
                show: show,
                style: style,
                element : element,
                type: type 
            }
  }

const usePopups = create<Popup>((set) => ({
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
        showDeleteDevice: false,
        setShowDeleteDevice: (to) => {
            set( 
                {
                    showDeleteDevice: to
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
        showDeviceSelector: menuDefault,
        setShowDeviceSelector: (show, id, type) => {
            const menu = getOffset(show, id, type)
            set( 
                {
                    showDeviceSelector: menu
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
        showUserMenu: menuDefault,
        setShowUserMenu: (show, id, type) => {
            const menu = getOffset(show, id, type)
            set(
                {
                    showUserMenu: menu
                }
            )
        },
        showDeviceMenu: menuDefault,
        setShowDeviceMenu: (show, id, type) => {
            const menu = getOffset(show, id, type)
            set(
                    {
                        showDeviceMenu: menu
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
    }
))

export default usePopups
