import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import useAlarm from '../components/Alarms/AlarmComponents/alarmStates'

export type WindowSize = {
    width:     number
    height:    number
    landscape: boolean
}

export interface PopupSlice {
    showEditDevice:      boolean
    showSettings:        boolean
    showDeleteDevice:    boolean
    showAlarmPop:        boolean
    showAdminPop:        boolean
    showEditAlarm:       boolean
    showAddAlarm:        boolean
    showDeleteAlarm:     boolean
    showAdminConfirm:    boolean
    showAddDevice:       boolean
    showQRDialog:        boolean
    showLogOut:          boolean
    showEditProfile:     boolean
    showAbout:           boolean
    showAdminLogIn:      boolean
    showServerEdit:      boolean
    showUserMenu:        boolean
    showDeviceMenu:      boolean
    showToast:           boolean
    showColor:           boolean
    showTimepicker:      boolean
    showTask:            boolean
    showClearSettings:   boolean
    showChangeColors:    boolean
    showPasswordForgot:  boolean
    showResendActivation: boolean
    showQrCodeReader:    boolean
    showSaveColorScheme: boolean
    isMobile:            boolean
    windowSize:          WindowSize
    navigationTriggered: number
    setShowEditDevice:      (to: boolean) => void
    setShowSettings:        (to: boolean) => void
    setShowDeleteDevice:    (to: boolean) => void
    setShowAlarmPop:        (to: boolean) => void
    setShowAdminPop:        (to: boolean) => void
    setShowEditAlarm:       (to: boolean) => void
    setShowAddAlarm:        (to: boolean) => void
    setShowDeleteAlarm:     (to: boolean) => void
    setShowAdminConfirm:    (to: boolean) => void
    setShowAddDevice:       (to: boolean) => void
    setShowQRDialog:        (to: boolean) => void
    setShowLogOut:          (to: boolean) => void
    setShowEditProfile:     (to: boolean) => void
    setShowAbout:           (to: boolean) => void
    setShowAdminLogIn:      (to: boolean) => void
    setShowServerEdit:      (to: boolean) => void
    setShowUserMenu:        (to: boolean) => void
    setShowDeviceMenu:      (to: boolean) => void
    setShowToast:           (to: boolean) => void
    setShowColor:           (to: boolean) => void
    setShowTimepicker:      (to: boolean) => void
    setShowTask:            (to: boolean) => void
    setShowClearSettings:   (to: boolean) => void
    setShowChangeColors:    (to: boolean) => void
    setShowPasswordForgot:  (to: boolean) => void
    setShowResendActivation:(to: boolean) => void
    setShowQrCodeReader:    (to: boolean) => void
    setShowSaveColorScheme: (to: boolean) => void
    setMobile:              (to: boolean) => void
    setWindowSize:          (width: number, height: number, landscape: boolean) => void
    setNavigationTriggered: () => void
}

export const createPopupSlice: StateCreator<BoundStore, [], [], PopupSlice> = (set, get) => {
    // Hides the toast bar whenever a dialog opens
    const withToast = (key: keyof BoundStore, to: boolean) =>
        set({ showToast: !to, [key]: to } as Partial<BoundStore>)

    return {
        showEditDevice:      false,
        showSettings:        false,
        showDeleteDevice:    false,
        showAlarmPop:        false,
        showAdminPop:        false,
        showAddAlarm:        false,
        showTask:            false,
        showEditAlarm:       false,
        showAdminConfirm:    false,
        showDeleteAlarm:     false,
        showAddDevice:       false,
        showQRDialog:        false,
        showLogOut:          false,
        showEditProfile:     false,
        showAbout:           false,
        showAdminLogIn:      false,
        showServerEdit:      false,
        showUserMenu:        false,
        showColor:           false,
        showDeviceMenu:      false,
        showTimepicker:      false,
        showClearSettings:   false,
        showChangeColors:    false,
        showPasswordForgot:  false,
        showResendActivation: false,
        showQrCodeReader:    false,
        showSaveColorScheme: false,
        showToast:  true,
        isMobile:   false,
        windowSize: {
            width:     window.innerWidth,
            height:    window.innerHeight,
            landscape: [-90, 90].includes(window.orientation as number),
        },
        navigationTriggered: 0,

        // Simple setters
        setShowSettings:        (to) => set({ showSettings: to }),
        setShowDeleteDevice:    (to) => set({ showDeleteDevice: to }),
        setShowAlarmPop:        (to) => set({ showAlarmPop: to }),
        setShowAdminPop:        (to) => set({ showAdminPop: to }),
        setShowAdminConfirm:    (to) => set({ showAdminConfirm: to }),
        setShowDeleteAlarm:     (to) => set({ showDeleteAlarm: to }),
        setShowLogOut:          (to) => set({ showLogOut: to }),
        setShowAbout:           (to) => set({ showAbout: to }),
        setShowAdminLogIn:      (to) => set({ showAdminLogIn: to }),
        setShowServerEdit:      (to) => set({ showServerEdit: to }),
        setShowUserMenu:        (to) => set({ showUserMenu: to }),
        setShowColor:           (to) => set({ showColor: to }),
        setShowDeviceMenu:      (to) => set({ showDeviceMenu: to }),
        setShowToast:           (to) => set({ showToast: to }),
        setShowTimepicker:      (to) => set({ showTimepicker: to }),
        setShowTask:            (to) => set({ showTask: to }),
        setMobile:              (to) => set({ isMobile: to }),
        setShowClearSettings:   (to) => set({ showClearSettings: to }),
        setShowChangeColors:    (to) => set({ showChangeColors: to }),
        setShowPasswordForgot:  (to) => set({ showPasswordForgot: to }),
        setShowResendActivation:(to) => set({ showResendActivation: to }),
        setShowQrCodeReader:    (to) => set({ showQrCodeReader: to }),
        setShowSaveColorScheme: (to) => set({ showSaveColorScheme: to }),

        // Setters that hide the toast bar when a dialog opens
        setShowEditDevice:  (to) => withToast('showEditDevice', to),
        setShowEditAlarm:   (to) => withToast('showEditAlarm', to),
        setShowAddDevice:   (to) => withToast('showAddDevice', to),
        setShowEditProfile: (to) => withToast('showEditProfile', to),
        setShowAddAlarm: (to) => {
            if (to) useAlarm.getState().onAddOpen()
            withToast('showAddAlarm', to)
        },

        // Setter with side effect
        setShowQRDialog: (to) => {
            get().setFetchQR(to)
            set({ showQRDialog: to })
        },

        setWindowSize: (width, height, landscape) => set({ windowSize: { width, height, landscape } }),
        setNavigationTriggered: () => set(state => ({
            navigationTriggered: (state.navigationTriggered + 1) % 2
        })),
    }
}
