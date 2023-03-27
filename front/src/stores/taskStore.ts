import { create } from 'zustand'
 
export enum LaunchMode{
    None="none",
    Snooze="snooze",
    TurnOff="turnOff",   
}
type UseTask = {
    solved: boolean
    launchMode: LaunchMode,
    setLaunchMode: (launchMode: LaunchMode) => void
    setSolved: (solved: boolean) => void
}

const  useTask = create<UseTask>((set) => ({
  solved: false,
  launchMode: LaunchMode.None,
  setLaunchMode: (mode) => set({ launchMode: mode }),
  setSolved: (solved) => {
    set(
        {
            solved: solved,
        }
    )
  }
}))

export default useTask
