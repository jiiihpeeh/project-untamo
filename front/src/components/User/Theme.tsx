import { create } from "zustand"
import { ColorMode, useColorMode } from '@chakra-ui/react'
import React, {useEffect, useRef } from "react"
import { usePopups,  useSettings } from "../../stores"
import { ColorMode as ColorModeType } from "../../type"

export enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}

type ThemeStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorMode: Theme
  setColorMode: (colorMode: Theme) => void
  toggled: boolean
  toggle: () => void
  init : boolean
  setInit: (init: boolean) => void
}

function setUITheme(theme: Theme | null) {
  theme ? localStorage.setItem("ui-theme", theme) : localStorage.removeItem("ui-theme")
}

function getUITheme() {
  return localStorage.getItem("ui-theme") || ""
}


export const useTheme = create<ThemeStore>()(
  (set, get) => ({
    theme: Theme.Light,
    setTheme: (theme: Theme) => {
      if (theme === Theme.System) {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        let mode = (isDark) ? Theme.Dark : Theme.Light
        set({ colorMode: mode,theme: Theme.System })
      } else {
        set({ colorMode: theme, theme: theme})
      }
      set({  toggled: !get().toggled })
      setUITheme(theme)
    },
    colorMode: Theme.Light,
    setColorMode: (colorMode: Theme) => {
      set({ colorMode: colorMode, toggled: !get().toggled })
    },
    toggled: false,
    toggle: () => set({ toggled: !get().toggled }),
    init: false,
    setInit: (init: boolean) => set({init: init}),
  })
)


//eventlistener and initializer for system theme
function themeWatcher() {
    const { setTheme } = useTheme.getState()
    switch (getUITheme()) {
      case Theme.Light:
        setTheme(Theme.Light)
        break
      case Theme.Dark:
        setTheme(Theme.Dark)
        break
      default:          
        setTheme(Theme.System)
        break
    }
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    function handleChange() {
      const thm = useTheme.getState().theme 
      if (thm === Theme.System) {
        setTheme(Theme.System)
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
  const init = useTheme((state) => state.init)
  const setInit = useTheme((state) => state.setInit)

  useEffect(() => {
    if (colorMode !== color){
      toggleColorMode()
      setSettingsColorMode(color as unknown as ColorModeType)
      init ? setShowChangeColors(true): null
    }
    setInit(true)
  }, [toggled])
  return null
}