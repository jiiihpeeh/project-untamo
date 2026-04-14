import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { CloseTask, ColorMode } from '../type'

import { apiPost } from './api'
import { notification, Status } from '../components/notification'

export type CardColors = {
    even: string
    odd: string
    inactive: string
    background: string
}
export type UserColors = { [key: string]: CardColors }

export enum NotificationType {
    Desktop = "desktop",
    Toast   = "toast",
    Both    = "both",
    None    = "none"
}

export const defaultCardLight: CardColors = {
    inactive:   "#ececec",
    even:       '#c4ffff ',
    odd:        "#ffff9d",
    background: "#ffffff"
}
export const defaultCardDark: CardColors = {
    inactive:   "#717171",
    even:       "#00e7e7",
    odd:        "#ea9200",
    background: "#000000"
}

export const dialogSizes = new Map<number, string>([[0, "sm"], [1, "md"], [2, "lg"]])

export function defaultWebColors(): UserColors {
    return { "Light": defaultCardLight, "Dark": defaultCardDark }
}

async function sendWebColors(colors: UserColors) {
    const colorsClone = JSON.parse(JSON.stringify(colors)) as UserColors
    delete colorsClone["Light"]
    delete colorsClone["Dark"]
    if (Object.keys(colorsClone).length === 0) return
    try {
        await apiPost('/api/web-colors', colorsClone)
    } catch {
        notification('Web Colors', 'Failed to save web colors', Status.Error)
    }
}

function themeSettings(light = defaultCardLight.background, dark = defaultCardDark.background) {
    return { light, dark }
}

export interface SettingsSlice {
    dialogSize:       number
    navBarTop:        boolean
    height:           number
    mb:               number
    mt:               number
    clock24:          boolean
    closeTask:        CloseTask
    cardColors:       CardColors
    snoozePress:      number
    colorMode:        ColorMode
    isLight:          boolean
    volume:           number
    notificationType: NotificationType
    theme:            Record<string, any>
    webColors:        UserColors
    setDialogSize:        (size: number) => void
    setColorMode:         (mode: ColorMode) => void
    setCloseTask:         (task: CloseTask) => void
    setClock24:           (to: boolean) => void
    setNavBarTop:         (to: boolean) => void
    setHeight:            (n: number) => void
    setCardColors:        (color: string, mode: keyof CardColors) => void
    loadColorScheme:      (theme: string) => void
    setDefaultCardColors: () => void
    setPanelSize:         (size: number) => void
    setSnoozePress:       (n: number) => void
    setVolume:            (volume: number) => void
    setTheme:             (light: string, dark: string) => void
    setNotificationType:  (type: NotificationType) => void
    setWebColors:         (colors: UserColors) => void
}

export const createSettingsSlice: StateCreator<BoundStore, [], [], SettingsSlice> = (set, get) => ({
    navBarTop:        true,
    height:           56,
    mt:               56,
    mb:               0,
    clock24:          true,
    colorMode:        ColorMode.Light,
    dialogSize:       0,
    isLight:          true,
    cardColors:       defaultCardLight,
    closeTask:        CloseTask.Obey,
    snoozePress:      200,
    volume:           0.9,
    theme:            themeSettings(),
    notificationType: NotificationType.Desktop,
    webColors:        { "Light": defaultCardLight, "Dark": defaultCardDark },

    setDialogSize: (size) => set({ dialogSize: size }),
    setColorMode: (colorMode) => set({ colorMode, isLight: colorMode === ColorMode.Light }),
    setClock24: (to) => set({ clock24: to }),
    setHeight: (n) => set({ height: n }),
    setNavBarTop: (to) => {
        if (to) {
            set({ mt: get().height, mb: 0, navBarTop: to })
        } else {
            set({ mt: 0, mb: get().height, navBarTop: to })
        }
    },
    setCloseTask: (task) => set({ closeTask: task }),
    setCardColors: (color, colorMode) => {
        const colors = { ...get().cardColors, [colorMode]: color } as CardColors
        set({ cardColors: colors })
        document.body.style.backgroundColor = colors.background
    },
    loadColorScheme: (theme) => {
        const webColors = get().webColors
        if (!(theme in webColors)) return
        const colors = webColors[theme]
        set({ cardColors: colors })
        document.body.style.backgroundColor = colors.background
    },
    setDefaultCardColors: () => {
        const colorsDefault = get().colorMode === ColorMode.Light ? defaultCardLight : defaultCardDark
        set({ cardColors: colorsDefault })
        document.body.style.backgroundColor = colorsDefault.background
    },
    setPanelSize: (size) => set({
        height: size,
        mt: get().mt > 0 ? size : 0,
        mb: get().mb > 0 ? size : 0,
    }),
    setSnoozePress: (n) => set({ snoozePress: n }),
    setVolume: (volume) => set({ volume }),
    setTheme: (light, dark) => set({ theme: themeSettings(light, dark) }),
    setNotificationType: (type) => set({ notificationType: type }),
    setWebColors: (colors) => {
        set({ webColors: colors })
        sendWebColors(colors)
    },
})
