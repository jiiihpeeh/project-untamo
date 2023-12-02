import { create } from "zustand"
import { ColorMode, useColorMode } from '@chakra-ui/react'
import React, {useEffect, useRef } from "react"
import { usePopups,  useSettings } from "../../stores"
import { ColorMode as ColorModeType } from "../../type"

type ThemeStore = {
  theme: ColorModeType
  setTheme: (theme: ColorModeType) => void
  colorMode: ColorModeType
  setColorMode: (colorMode: ColorModeType) => void
  toggled: boolean
  toggle: () => void
  _init : boolean
  _setInit: (init: boolean) => void
}

function setUITheme(theme: ColorModeType | null) {
  theme ? localStorage.setItem("ui-theme", theme) : localStorage.removeItem("ui-theme")
}

function getUITheme() {
  return localStorage.getItem("ui-theme") || ""
}


export const useTheme = create<ThemeStore>()(
  (set, get) => ({
    theme: ColorModeType.Light,
    setTheme: (theme: ColorModeType) => {
      if (theme === ColorModeType.System) {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        let mode = (isDark) ? ColorModeType.Dark : ColorModeType.Light
        set({ colorMode: mode,theme: ColorModeType.System })
      } else {
        set({ colorMode: theme, theme: theme})
      }
      set({  toggled: !get().toggled })
      setUITheme(theme)
    },
    colorMode: ColorModeType.Light,
    setColorMode: (colorMode: ColorModeType) => {
      set({ colorMode: colorMode, toggled: !get().toggled })
    },
    toggled: false,
    toggle: () => set({ toggled: !get().toggled }),
    _init: false,
    _setInit: (init: boolean) => set({_init: init}),
  })
)


//eventlistener and initializer for system theme
function themeWatcher() {
    const { setTheme } = useTheme.getState()
    switch (getUITheme()) {
      case ColorModeType.Light:
        setTheme(ColorModeType.Light)
        break
      case ColorModeType.Dark:
        setTheme(ColorModeType.Dark)
        break
      default:          
        setTheme(ColorModeType.System)
        break
    }
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    function handleChange() {
      const thm = useTheme.getState().theme 
      if (thm === ColorModeType.System) {
        setTheme(ColorModeType.System)
      }
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
}
themeWatcher()

export default function ThemeComponent(){
  const color = useTheme((state) => state.colorMode)
  const { colorMode, toggleColorMode } = useColorMode()
  const toggled = useTheme((state) => state.toggled)
  const setShowChangeColors = usePopups((state) => state.setShowChangeColors)
  const setSettingsColorMode = useSettings((state) => state.setColorMode)
  const _init = useTheme((state) => state._init)
  const _setInit = useTheme((state) => state._setInit)

  useEffect(() => {
    if (colorMode !== color){
      toggleColorMode()
      setSettingsColorMode(color as unknown as ColorModeType)
      _init ? setShowChangeColors(true): null
    }
    _setInit(true)
  }, [toggled])
  return null
}