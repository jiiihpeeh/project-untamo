import { format } from 'date-fns'
import { useState } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CardColors =  {
    even: string,
    odd: string,
    inactive: string
}
const defaultCard : CardColors = { inactive: "#ececec", even: '#c4ffff ', odd:"#ffff9d" }
type UseSettings =  {
    navBarTop: boolean,
    height: number,
    mb: number,
    mt: number,
    clock24: boolean,
    setTime24Format: (to: boolean) => void,
    setNavBarTop: (to: boolean) => void
    setHeight: (n:number) => void,
    cardColors: CardColors,
    setCardColors: (color : string, mode: string) => void,
    setDefaultCardColors: () => void,
    setPanelSize: (size: number) => void,
}


const setColors = (color: string, mode: string) =>{
    let colors = useSettings.getState().cardColors
    let newColors : CardColors = {...colors, [mode]: color }
    useSettings.setState({cardColors: {...newColors}})
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
            setTime24Format: (to) =>{
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
            setCardColors: (color, mode) => {
                setColors(color, mode)
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
                        mt: (get().mt >0)?size:0,
                        mb: (get().mb >0)?size:0
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
              }
          ),
      }
    )
)


export default useSettings