import React ,  { useEffect } from "react"
import { SafeAreaView, StatusBar } from "react-native"
import {
  ThemeProvider,
  Button,
  Icon,
  Snackbar,
  SnackbarRef,
} from "react-native-magnus"
import  useMessage from "../stores/messageStore"

const snackbarRef  = React.createRef<any>()


const Notification = () => {
  const message = useMessage((state)=>state.message)
  const duration = useMessage((state)=>state.duration)
  const iconName = useMessage((state)=>state.iconName)
  const color = useMessage((state)=>state.color)
  const fontSize = useMessage((state)=>state.fontSize)
  const fontFamily = useMessage((state)=>state.fontFamily)
  const snackColor = useMessage((state)=>state.snackColor)
  const background = useMessage((state)=>state.background)
  useEffect(()=>{
    if (snackbarRef.current) {
      snackbarRef.current.show(
        message,
        {
          duration: duration,
          suffix: <Icon
            name={iconName}
            color={color}
            fontSize={fontSize}
          />
        }
      )
    }
  },[message, duration])
  return (<Snackbar
            ref={snackbarRef}
            bg={background}
            color={snackColor}
          />)
}

export default Notification