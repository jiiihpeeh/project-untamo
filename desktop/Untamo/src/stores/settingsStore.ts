import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CloseTask } from '../type'

export type CardColors =  {
    even: string,
    odd: string,
    inactive: string
}

const defaultCard : CardColors = { 
                                    inactive: "#ececec", 
                                    even: '#c4ffff ', 
                                    odd:"#ffff9d" 
                                 }

type UseSettings =  {
    navBarTop: boolean,
    height: number,
    mb: number,
    mt: number,
    clock24: boolean,
    closeTask: CloseTask,
    cardColors: CardColors,
    snoozePress: number,
    alarmOnTop: boolean,
    setAlarmOnTop: (value: boolean) => void
    setCloseTask: (task: CloseTask) => void,
    setClock24: (to: boolean) => void,
    setNavBarTop: (to: boolean) => void,
    setHeight: (n:number) => void,
    setCardColors: (color : string, mode: keyof CardColors) => void,
    setDefaultCardColors: () => void,
    setPanelSize: (size: number) => void,
    setSnoozePress: (n: number) => void,
    
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
            cardColors: defaultCard,
            closeTask: CloseTask.Obey,
            alarmOnTop: true,
            setAlarmOnTop: (value) => {
                set(
                    {
                        alarmOnTop: value
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
            },
            setDefaultCardColors: () => {
                set(
                    {
                        cardColors: {...defaultCard},
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
            snoozePress: 200,
            setSnoozePress: (n) => {
                set(
                    {
                        snoozePress: n
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
                alarmOnTop: state.alarmOnTop,
              }
          ),
      }
    )
)

export default useSettings