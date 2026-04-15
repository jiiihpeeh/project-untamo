import type { AlarmSlice } from './alarmStore'
import type { DeviceSlice } from './deviceStore'
import type { LoginSlice } from './loginStore'
import type { AdminSlice } from './adminStore'
import type { QRSlice } from './QRStore'
import type { SettingsSlice } from './settingsStore'
import type { EmojiSlice } from './emojiStore'
import type { PopupSlice } from './popUpStore'
import type { ServerSlice } from './serverStore'
import type { TimeoutsSlice } from './timeoutsStore'
import type { AudioSlice } from './audioStore'
import type { TaskSlice } from './taskStore'

export type BoundStore =
    AlarmSlice &
    DeviceSlice &
    LoginSlice &
    AdminSlice &
    QRSlice &
    SettingsSlice &
    EmojiSlice &
    PopupSlice &
    ServerSlice &
    TimeoutsSlice &
    AudioSlice &
    TaskSlice
