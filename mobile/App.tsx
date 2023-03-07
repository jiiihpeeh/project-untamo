import { StatusBar, SafeAreaView  } from 'react-native'
import { ThemeProvider, Button, Icon, Div,Text,  } from 'react-native-magnus'
import  React, { useState, useEffect, useRef } from 'react'
import LogIn from './components/User/LogIn'
import Notification from './components/Notification'
import AlarmView from './components/Alarms/AlarmView'
import { useLogIn } from './stores'
import { SessionStatus } from './type'
import sleep from './components/sleep'
const  App =  () => {

  const sessionStatus = useLogIn((state)=> state.sessionValid)
  const checkSession = useLogIn((state) => state.validateSession)
  const check = useRef(false)

  useEffect(() => {
    const checker = async() =>{
        if(!check.current){
          await sleep(5)
          checkSession()
          check.current = true
        }

  }
    checker()
  },[sessionStatus])
  return (
    <ThemeProvider >
   
      <StatusBar/>
        <SafeAreaView style={{ flex: 1 }}>
        {(sessionStatus=== SessionStatus.Valid)?<AlarmView/>:<LogIn/> }

        
        <Notification/>
        </SafeAreaView>
      <StatusBar/>
    </ThemeProvider>
  )
}


export default App

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
