import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CloseTask, ColorMode} from '../type'

import { extendTheme } from '@chakra-ui/react'
import type { StyleFunctionProps } from '@chakra-ui/styled-system'
import { mode } from '@chakra-ui/theme-tools'
import { Status, notification } from '../components/notification'
import { getCommunicationInfo } from '../stores'
import { Body, getClient } from '@tauri-apps/api/http'
import { isSuccess } from '../utils'

export type CardColors =  {
    even: string,
    odd: string,
    inactive: string
    background: string
}
export type UserColors = {
    [key: string]: CardColors
}

export enum WindowTop{
    Always="always",
    Alarm="alarm",
    Never="never"
}

export enum NotificationType{
    Desktop="desktop",
    Toast="toast",
    Both="both",
    None="none"
}

export const defaultCardLight : CardColors = { 
    inactive: "#ececec", 
    even: '#c4ffff ', 
    odd:"#ffff9d" ,
    background: "#ffffff"
}

export const defaultCardDark : CardColors = {
    inactive:"#717171",
    even:"#00e7e7",
    odd:"#ea9200",
    background: "#000000"
}

export function defaultWebColors(): UserColors {
    return {"Light": defaultCardLight, "Dark": defaultCardDark}
}

export const dialogSizes = new Map<number, string>( [[0, "sm"], [1, "md"], [2, "lg"]])


async function sendWebColors(colors: UserColors){
    //clone object
    const colorsClone = JSON.parse(JSON.stringify(colors)) as UserColors
    //remove "Light" and "Dark
    delete colorsClone["Light"]
    delete colorsClone["Dark"]
    //check if colors are empty
    if(Object.keys(colors).length === 0){
        return
    }
    const {server, token} = getCommunicationInfo()
    const post = JSON.stringify(colorsClone) 
    try {
        const client = await getClient()
        const res = await client.request(
          {
            url: `${server}/api/web-colors`,
            method: "POST",
            headers: {
              token: token
            },
            body: Body.json(colorsClone)
          }
        )
        //console.log(res.data)
        isSuccess(res)
      } catch (err: any) {
        notification('Web Colors', 'Failed to save web colors', Status.Error)
      }
}

type UseSettings =  {
    dialogSize: number
    navBarTop: boolean,
    height: number,
    mb: number,
    mt: number,
    clock24: boolean,
    closeTask: CloseTask,
    cardColors: CardColors,
    snoozePress: number,
    onTop: WindowTop,
    colorMode: ColorMode,
    isLight: boolean,
    volume: number,
    notificationType: NotificationType,
    theme: Record<string, any>,
    webColors: UserColors,
    setDialogSize: (size: number) => void,
    setColorMode: (mode: ColorMode) => void,
    setOnTop: (value: WindowTop) => void,
    setCloseTask: (task: CloseTask) => void,
    setClock24: (to: boolean) => void,
    setNavBarTop: (to: boolean) => void,
    setHeight: (n:number) => void,
    setCardColors: (color : string, mode: keyof CardColors) => void,
    setDefaultCardColors: () => void,
    loadColorScheme: (theme: string) => void,
    setPanelSize: (size: number) => void,
    setSnoozePress: (n: number) => void,
    setVolume: (n: number) => void,
    setNotificationType: (type: NotificationType) => void,
    setTheme: (light: string, dark: string) => void,
    setWebColors: (colors: UserColors) => void,
}

function themeSettings(light=defaultCardLight.background, dark=defaultCardDark.background){
    const theme = extendTheme({
        styles: {
            global: (props: StyleFunctionProps) => ({
              body: {
                        bg: mode(light, dark)(props),
                    }
            })
        },
    })
    return theme
}

const useSettings = create<UseSettings>()(
    persist(
      (set, get) => (
          {
            navBarTop: true,
            height: 56,
            mt: 56,
            mb:0,
            clock24: true,
            colorMode: ColorMode.Light,
            dialogSize: 0,
            isLight: true,
            cardColors: defaultCardLight,
            closeTask: CloseTask.Obey,
            onTop: WindowTop.Alarm,
            snoozePress: 200,
            volume: 0.9,
            theme: themeSettings(),
            notificationType: NotificationType.Desktop,
            webColors: {"Light": defaultCardLight, "Dark": defaultCardDark},
            setDialogSize: (size: number) => set({ dialogSize: size }),
            setColorMode: (mode: ColorMode) => {
                set(
                    { 
                        colorMode: mode,
                        isLight: mode === ColorMode.Light,
                    }
                )
            },
            setClock24: (to) =>{
                set(
                    {
                        clock24: to
                    }
                )
            },
            setHeight: (n:number) => {
                set(
                    {
                        height: n 
                    }
                )
            },
            setNavBarTop: (to) =>{
                if(to){
                    set(
                        {
                            mt: get().height,
                            mb: 0,
                            navBarTop: to,
                        }
                    )
                }else{
                    set(
                        {
                            mt: 0,
                            mb: get().height,
                            navBarTop: to
                        }
                    )
                }
            },
            setOnTop: (value) => {
                set(
                    {
                        onTop: value
                    }
                )
            },
            setCloseTask:(task) => {
                set(
                    {
                        closeTask: task,
                    }
                )
            },
            setCardColors: (color, mode) => {
                let colors = {...get().cardColors, [mode]: color } as CardColors
                set(
                    {
                        cardColors: colors
                    }
                )
                document.body.style.backgroundColor = colors.background
            },
            loadColorScheme: (theme) => {
                //check if theme is in webColors
                if(!(theme in get().webColors)){
                    return
                }
                let colors = get().webColors[theme]

                set(
                    {
                        cardColors: colors,
                    }
                )
                document.body.style.backgroundColor = colors.background
            },
            setDefaultCardColors: () => {
                let colorsDefault = (get().colorMode === ColorMode.Light)? defaultCardLight : defaultCardDark
                set(
                    {
                        cardColors: colorsDefault,
                    }
                )
                document.body.style.backgroundColor = colorsDefault.background
            },
            setPanelSize: (size) => {
                set(
                    {
                        height: size,
                        mt: (get().mt > 0)?size:0,
                        mb: (get().mb > 0)?size:0
                    }
                )
            },
            setSnoozePress: (n) => {
                set(
                    {
                        snoozePress: n
                    }
                )
            },
            setVolume: (volume)=> {
                set(
                    {
                        volume: volume
                    }
                )
            },
            setTheme: (light, dark) => {
                set(
                    {
                        theme: themeSettings(light, dark)
                    }
                )
            },
            setNotificationType: (type) => {
                set(
                    {
                        notificationType: type
                    }
                )
            },
            setWebColors: (colors) => {
                set(
                    {
                        webColors: colors
                    }
                )
                sendWebColors(colors)
            },
          }
      ),
      {
          name: 'settings', 
          storage: createJSONStorage(() => localStorage), 
          partialize: (state) => (
              { 
                navBarTop: state.navBarTop,
                mt: state.mt,
                mb: state.mb,
                height: state.height,
                cardColors: state.cardColors,
                clock24: state.clock24,
                closeTask: state.closeTask,
                snoozePress: state.snoozePress,
                onTop: state.onTop,
                isLight: state.isLight,
                volume: state.volume,
                notificationType: state.notificationType,
              }
          ),
      }
    )
)

export default useSettings