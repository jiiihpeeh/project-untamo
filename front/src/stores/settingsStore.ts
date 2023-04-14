import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CloseTask, ColorMode} from '../type'

export type CardColors =  {
    even: string,
    odd: string,
    inactive: string
}


const defaultCardLight : CardColors = { 
                                    inactive: "#ececec", 
                                    even: '#c4ffff ', 
                                    odd:"#ffff9d" 
                                 }
const defaultCardDark : CardColors = {
                                    inactive:"#717171",
                                    even:"#00e7e7",
                                    odd:"#ea9200"
                                }
export const dialogSizes = new Map<number, string>( [[0, "sm"], [1, "md"], [2, "lg"]])

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
    colorMode: ColorMode,
    isLight: boolean,
    volume: number,
    setDialogSize: (size: number) => void,
    setColorMode: (mode: ColorMode) => void,
    setCloseTask: (task: CloseTask) => void,
    setClock24: (to: boolean) => void,
    setNavBarTop: (to: boolean) => void,
    setHeight: (n:number) => void,
    setCardColors: (color : string, mode: keyof CardColors) => void,
    setDefaultCardColors: () => void,
    setPanelSize: (size: number) => void,
    setSnoozePress: (n: number) => void,
    setVolume: (volume: number) => void,
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
            snoozePress: 200,
            volume: 0.9,
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
            },
            setDefaultCardColors: () => {
                let colorsDefault = (get().colorMode === ColorMode.Light)? defaultCardLight : defaultCardDark
                set(
                    {
                        cardColors: colorsDefault,
                    }
                )
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
                        volume: volume,
                    }
                )
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
                isLight: state.isLight,
                volume: state.volume,
              }
          ),
      }
    )
)

export default useSettings