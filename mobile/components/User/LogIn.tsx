import { useState, useEffect } from "react"
import ServerAddress from "./ServerAddress"
import { Button, Icon, Div,Text,  Input, Image, Modal } from 'react-native-magnus'
import { ScrollView, TouchableHighlight } from 'react-native'
import QrWindow from './QrWindow'
import useLogIn from "../../stores/loginStore"

const LogIn = () => {
  //const [visible, setVisible] = useState(false)

    const [isLogInFormValid, setIsLogInFormValid] = useState(false)
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [ qrcodeScanner, setQrcodeScanner] = useState(false)
    const [ scanData, setScanData ] = useState('')
    const logIn = useLogIn((state)=> state.logIn)

    // const logInStorage = async (resData) =>{
    //   try{
    //     let userInfoSave = Object.assign({}, resData)
    //     delete userInfoSave.token
    //     await AsyncStorage.setItem('token', JSON.stringify(resData.token))
    //     await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoSave))

    //     setToken(resData.token)
    //     setUserInfo(userInfoSave)
    //     setSessionStatus(true)
    //     let deviceData = await axios.get(`${server}/api/devices`,{
    //       headers: {'token': resData.token}
    //       })
    //     let devices = deviceData.data
    //     //console.log('fetched devices: ',devices)
    //     await AsyncStorage.setItem('devices', JSON.stringify(devices))
    //     setDevices(devices)
    //     let alarmData = await axios.get(`${server}/api/alarms`,
    //                 {headers: {'token': resData.token}})
    //     console.log("ALARM!!!!: ", alarmData.data)
    //     let alarms = alarmData.data
        
    //     await AsyncStorage.setItem('alarms', JSON.stringify(alarms))
        
    //     setAlarms(alarms)
    //   }catch(err){
    //     console.log(err)
    //   }
    // } 
    useEffect(() => {
        const isOK = () => {
          if(password.length > 5 && emailPattern.test(user)){
            setIsLogInFormValid(true)
          }else {
            setIsLogInFormValid(false)
          }
        }

        const emailPattern = new RegExp(".+@.+..+")
        isOK()
    },[user, password])
    // useEffect(() => {
    //   const scannerLogIn = async () => {
    //     setQrcodeScanner(false)
    //     if(scanData && scanData.length > 10){
    //       try{
    //         let scanObject = JSON.parse(scanData)
    //         console.log(scanObject.token)
    //         console.log({token: scanObject.token, ensure: scanObject.ensure})
    //         setServer(scanObject.server)
    //         let res = await axios.post(`${scanObject.server}/qrlogin`, {token: scanObject.token, ensure: scanObject.ensure})
    //         console.log(res.data)
    //         await logInStorage(res.data)
            
    //       }catch(err){
    //         console.log(err
    //       }

    //     }
    //   }
    //   scannerLogIn()
    // },[scanData])
    return ( <ScrollView>
              <Div 
                flex={1} 
                alignItems='center'
              >
              <ServerAddress/>
              <Image
                    h={100}
                    w={74}
                    source={require('./logo.png')}              
                    />
                <Div>
                    <Input
                            placeholder="Email"
                            p={10}
                            focusBorderColor="blue700"
                            ml="xs"
                            mr="xs"
                            mt="xl"
                            w={300}
                            value={user}
                            onChangeText={text => setUser(text)} 
                     />
                    <Input
                            placeholder="Password"
                            p={10}
                            focusBorderColor="blue700"
                            secureTextEntry
                            ml="xs"
                            mr="xs"
                            mt="xl"                            
                            w={300}
                            value={password}
                            onChangeText={text => setPassword(text)} 
                    />
                    <Button onPress={()=>logIn(user,password)} 
                            ml="xs"
                            mr="xs"
                            mt="xl"                            
                            w={300}
                            disabled={!isLogInFormValid}
                          >
                            LogIn
                    </Button>
                </Div>
                {/* <Div m={10}>
                  <Button onPress={() => setQrcodeScanner(true)}> Scan Qr Code</Button>
                </Div>
             */}
          </Div>
          {/* <QrWindow 
            qrcodeScanner={qrcodeScanner} 
            setQrcodeScanner={setQrcodeScanner}
            setScanData={setScanData}
            scanData={scanData}
          /> */}
        </ScrollView>
          
    )
    return(<></>)
}

// const styles = StyleSheet.create({
//     textInput: {
//         margin: 16 
//     }
//   })

export default LogIn

// <Box style={{ backgroundColor: "gray", margin: 10}} >
// <TextInput 
//     name="user" 
//     onChangeText={text => setUser(text)} 
//     label="Email" 
//     style={styles.textInput} 
//     type="email"/>
// <TextInput 
//     label="Password" 
//     onChangeText={text => setPassword(text)} 
//     style={styles.textInput} 
//     secureTextEntry={true} />
// <Button 
//     title="Log In" 
//     disabled={!isLogInFormValid} 
//     onPress={logIn}
//     style={{ alignSelf: "center", margin: 10 }}/>

// </Box>

// <Text style={{ alignSelf: "center", margin: 15 }}>
//     or
// </Text>
// <Button
//     title="Scan QR code"
//     leading={props => <Icon name="qrcode-scan" {...props} />}
// />
// <Button
//      title="Go to Welcome"
//      onPress={() => navigation.navigate('Welcome')}
//      style={{ alignSelf: "center", marginTop: 30 }}
// />