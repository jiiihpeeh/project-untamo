import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BoundStore } from './storeTypes'

import { createAlarmSlice }    from './alarmStore'
import { createDeviceSlice }   from './deviceStore'
import { createLoginSlice }    from './loginStore'
import { createAdminSlice }    from './adminStore'
import { createQRSlice }       from './QRStore'
import { createSettingsSlice } from './settingsStore'
import { createEmojiSlice }    from './emojiStore'
import { createPopupSlice }    from './popUpStore'
import { createServerSlice }   from './serverStore'
import { createTimeoutsSlice } from './timeoutsStore'
import { createAudioSlice }    from './audioStore'
import { createTaskSlice }     from './taskStore'

import { checkSessionStatus } from './loginStore'
import { actionChecker }      from './serverStore'
import { compareTime, locationChecker } from './timeoutsStore'
import { listen } from '@tauri-apps/api/event'

export const useStore = create<BoundStore>()(
    persist(
        (...a) => ({
            ...createAlarmSlice(...a),
            ...createDeviceSlice(...a),
            ...createLoginSlice(...a),
            ...createAdminSlice(...a),
            ...createQRSlice(...a),
            ...createSettingsSlice(...a),
            ...createEmojiSlice(...a),
            ...createPopupSlice(...a),
            ...createServerSlice(...a),
            ...createTimeoutsSlice(...a),
            ...createAudioSlice(...a),
            ...createTaskSlice(...a),
        }),
        {
            name:    'store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // alarmStore
                alarms:        state.alarms,
                // deviceStore
                devices:        state.devices,
                viewableDevices: state.viewableDevices,
                currentDevice:  state.currentDevice,
                // loginStore
                wsToken:    state.wsToken,
                token:      state.token,
                signedIn:   state.signedIn,
                user:       state.user,
                expire:     state.expire,
                tokenTime:  state.tokenTime,
                wsPair:     state.wsPair,
                // settingsStore
                navBarTop:        state.navBarTop,
                mt:               state.mt,
                mb:               state.mb,
                height:           state.height,
                cardColors:       state.cardColors,
                clock24:          state.clock24,
                closeTask:        state.closeTask,
                snoozePress:      state.snoozePress,
                isLight:          state.isLight,
                volume:           state.volume,
                notificationType: state.notificationType,
                webColors:        state.webColors,
                // serverStore
                address:   state.address,
                wsAddress: state.wsAddress,
                wsAction:  state.wsAction,
                wsRegister: state.wsRegister,
                // emojiStore
                emojiData: state.emojiData,
            }),
        }
    )
)

// Start background daemons after the store is fully initialised
checkSessionStatus()
actionChecker()
compareTime()
locationChecker()

// Sync audio playback state from the Rust audio thread
listen<boolean>('audio-state', ({ payload }) => {
    useStore.setState({ plays: payload })
}).catch(console.error)

;(window as any).__store = useStore
