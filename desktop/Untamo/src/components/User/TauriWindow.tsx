import React, { useRef, useEffect } from 'react'
import { AlertDialog,  Button , AlertDialogOverlay,
         AlertDialogContent, AlertDialogHeader, AlertDialogBody, 
         AlertDialogFooter} from '@chakra-ui/react'
import {  usePopups, useAudio, useSettings } from '../../stores'
import { appWindow, PhysicalSize } from "@tauri-apps/api/window"
import { app, invoke } from "@tauri-apps/api"
import { sleep, urlEnds } from '../../utils'
import { notification, Status } from '../notification'
import { Path } from '../../type'
import {  WindowTop } from '../../stores/settingsStore'
import useTimeouts from '../../stores/timeoutsStore'

async function closeFunction() {
    const unlistenAsync = await appWindow.onCloseRequested(async (event) => {
        event.preventDefault()
        if (!urlEnds(Path.PlayAlarm)) {
            usePopups.getState().setShowCloseApp(true)
        } else {
            notification("Not so fast", "Alarm is On", Status.Info)
        }
    })
    const unlisten = await appWindow.onFocusChanged(async (event) => {
        let onTop = useSettings.getState().onTop
        if (onTop === WindowTop.Always) {
            await appWindow.setAlwaysOnTop(true)
        } else {
            if (!useAudio.getState().plays) {
                await appWindow.setAlwaysOnTop(false)
            }
        }
    })
    await appWindow.setMinSize(new PhysicalSize(410, 600))
    return unlistenAsync
}
closeFunction()

function CloseAction(){
  const showCloseApp = usePopups((state)=>state.showCloseApp)
  const setShowCloseApp = usePopups((state)=>state.setShowCloseApp)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const plays = useAudio(state=> state.plays)
  const visibleBeforePlayState = useRef(true)
  const onTop = useSettings(state=>state.onTop)

  async function hideSequence(ms:number){
    setShowCloseApp(false)
    await sleep(ms)
    appWindow.hide()
  }

  useEffect(()=>{
    async function topHandler(){
        if(onTop === WindowTop.Always){
            await appWindow.setAlwaysOnTop(true)
        }else{
            if(!plays){
                await appWindow.setAlwaysOnTop(false)
            }
        }
    }
    topHandler()
  },[onTop])
  useEffect(()=>{
    async function showIt(){
        if(plays){
            await appWindow.unminimize()
            if(!await appWindow.isVisible()){
                await appWindow.show()
                visibleBeforePlayState.current = false
                
            }else{
                visibleBeforePlayState.current = true
            }
            if(onTop === WindowTop.Alarm || onTop === WindowTop.Always ){    
                await appWindow.setAlwaysOnTop(true)
            }
        }else{
            if(onTop === WindowTop.Alarm || onTop === WindowTop.Never){    
                await appWindow.setAlwaysOnTop(false)
            }else{
                await appWindow.setAlwaysOnTop(true)
            }
            if(!visibleBeforePlayState.current){
                hideSequence(180)
            }
        }
    }
  showIt()
  },[plays])

  return (
          <AlertDialog
            isOpen={showCloseApp}
            onClose={()=>setShowCloseApp(false)}
            leastDestructiveRef={cancelRef}
            isCentered={true}
          >
          <AlertDialogOverlay>
            <AlertDialogContent>
                <AlertDialogHeader 
                    fontSize='lg' 
                    fontWeight='bold'
                >
                    Close App?
                </AlertDialogHeader>
                <AlertDialogBody>
                    What would you like to do?
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button 
                      onClick={()=>setShowCloseApp(false)}
                  >
                      Cancel
                  </Button>
                  <Button 
                      colorScheme='blue' 
                      onClick={()=> hideSequence(120)} 
                      ml={3}
                  >
                      Hide
                  </Button>
                  <Button 
                      colorScheme='red' 
                      onClick={()=> {
                                        setShowCloseApp(false)
                                        useAudio.getState().stop()
                                        invoke("close_window")
                                    }
                              } 
                      ml={3}
                  >
                      Close
                  </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
    )
}

export default CloseAction