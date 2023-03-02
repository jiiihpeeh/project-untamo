import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type UseServer = {
    address : string,
    wsAddress: string,
    setAddress : (input:string) => void
}
const metaAddress = document.head.querySelector("[property~=server][address]")?.attributes.getNamedItem("address")?.value
const baseAddress = (metaAddress)?metaAddress:"http://localhost:3001"

const websocketAddress = (server: string) =>{
  let base = server.split("://")
  if(base[0] ==="https"){
    return "wss://"+base[1]
  }
  return  "ws://"+base[1]
}
const useServer = create<UseServer>()(
    persist(
      (set) => (
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
          storage: createJSONStorage(() => localStorage), 
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
