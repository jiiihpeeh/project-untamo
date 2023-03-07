import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type UseServer = {
    address : string,
    wsAddress: string,
    setAddress : (input:string) => void
}
// const metaAddress = document.head.querySelector("[property~=server][address]")?.attributes.getNamedItem("address")?.value
// const baseAddress = (metaAddress)?metaAddress:"http://localhost:3001"
// const metaExtend = document.head.querySelector("[property~=url][extend]")?.attributes.getNamedItem("extend")?.value
// const baseExtend = (metaExtend)?metaExtend:""

const baseAddress = "https://kukkoilija.chickenkiller.com/server/action"

const websocketAddress = (server: string) =>{
  let base = server.split("://")
  if(base[0] ==="https"){
    return "wss://"+base[1]
  }
  return  "ws://"+base[1]
}
const useServer = create<UseServer>()(
    persist(
      (set, get) => (
          {
            address: baseAddress,
            wsAddress: websocketAddress(baseAddress),
            setAddress: (s) => set(
                  { 
                    address: s,
                    wsAddress: websocketAddress(s)
                  }
            ),
          }
      ),
      {
          name: 'server', 
          storage: createJSONStorage(() => AsyncStorage), 
          partialize: (state) => (
              { 
                address: state.address,
                wsAddress: state.wsAddress
              }
          ),
      }
    )
)


export default useServer
