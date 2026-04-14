import { create } from "zustand"
import { useEffect } from "react"
import { usePopups, useSettings } from "../../stores"
import { ColorMode as ColorModeType } from "../../type"

type ThemeStore = {
  theme: ColorModeType
  setTheme: (theme: ColorModeType) => void
  colorMode: ColorModeType
  toggled: boolean
  _init: boolean
  _setInit: (init: boolean) => void
}

function setUITheme(theme: ColorModeType | null) {
  theme ? localStorage.setItem("ui-theme", theme) : localStorage.removeItem("ui-theme")
}

function getUITheme() {
  return localStorage.getItem("ui-theme") || ""
}

function applyColorMode(mode: ColorModeType) {
  const isDark = mode === ColorModeType.Dark
  document.documentElement.classList.toggle('dark', isDark)
  document.body.classList.toggle('dark', isDark)
}

export const useTheme = create<ThemeStore>()(
  (set, get) => ({
    theme: ColorModeType.Light,
    setTheme: (theme) => {
      if (theme === ColorModeType.System) {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const mode = isDark ? ColorModeType.Dark : ColorModeType.Light
        set({ colorMode: mode, theme: ColorModeType.System, toggled: !get().toggled })
        applyColorMode(mode)
      } else {
        set({ colorMode: theme, theme, toggled: !get().toggled })
        applyColorMode(theme)
      }
      setUITheme(theme)
    },
    colorMode: ColorModeType.Light,
    toggled: false,
    _init: false,
    _setInit: (init) => set({ _init: init }),
  })
)

// Initialise theme from localStorage and watch for system changes
function themeWatcher() {
  const { setTheme } = useTheme.getState()
  switch (getUITheme()) {
    case ColorModeType.Light:  setTheme(ColorModeType.Light);  break
    case ColorModeType.Dark:   setTheme(ColorModeType.Dark);   break
    default:                   setTheme(ColorModeType.System);  break
  }
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  function handleChange() {
    if (useTheme.getState().theme === ColorModeType.System) {
      setTheme(ColorModeType.System)
    }
  }
  mq.addEventListener("change", handleChange)
  return () => mq.removeEventListener("change", handleChange)
}
themeWatcher()

export default function ThemeComponent() {
  const color = useTheme((state) => state.colorMode)
  const toggled = useTheme((state) => state.toggled)
  const setShowChangeColors = usePopups((state) => state.setShowChangeColors)
  const setSettingsColorMode = useSettings((state) => state.setColorMode)
  const _init = useTheme((state) => state._init)
  const _setInit = useTheme((state) => state._setInit)

  useEffect(() => {
    applyColorMode(color)
    setSettingsColorMode(color as unknown as ColorModeType)
    if (_init) setShowChangeColors(true)
    _setInit(true)
  }, [toggled])

  return null
}
