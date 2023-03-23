import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type NavPos = {
    top: string,
    bottom: string
}

const navTop = { top: "0px", bottom: "0px" }
const navBottom = { bottom: "1000px", top: "900px" }

type UseSettings =  {
    navBarTop: boolean,
    height: number,
    mb: number,
    mt: number,
    setNavBarTop: (to: boolean) => void
    setHeight: (n:number) => void,
    navPos : NavPos
}

const useSettings = create<UseSettings>()(
    persist(
      (set, get) => (
          {
            navBarTop: true,
            navPos: navTop,
            height: 56,
            mt: 56,
            mb:0,
            setHeight: (n:number) => {
                set(
                    {
                        height: n 
                    }
                )
            },
            setNavBarTop: (to) =>{
                set(
                    {
                        navBarTop: to
                    }
  
                )
                if(to){
                    set(
                        {
                            mt: get().height,
                            mb: 0
                        }
                    )
                }else{
                    set(
                        {
                            mt: 0,
                            mb: get().height                       }
                    )
                }
            },
          }
      ),
      {
          name: 'settings', 
          storage: createJSONStorage(() => localStorage), 
          partialize: (state) => (
              { 
                navBarTop: state.navBarTop,
              }
          ),
      }
    )
)


export default useSettings