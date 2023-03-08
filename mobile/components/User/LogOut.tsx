
import React, { useState } from "react"
import { Div, Button, Icon, Modal, ThemeProvider, Text } from "react-native-magnus"
import { useLogIn } from "../../stores"

const LogOut = () => {
    const [visible, setVisible] = useState(false)
    const logOut = useLogIn((state)=> state.logOut)

    
    return(
            <Div >
                <Button 
                  block m={10} 
                  onPress={() => setVisible(true)}
                >
                  LogOut
                </Button>

                <Modal 
                  isVisible={visible}
                >
                  {/* <Button
                    bg="gray400"
                    h={35}
                    w={35}
                    position="absolute"
                    top={50}
                    right={15}
                    rounded="circle"
                    onPress={() => setVisible(false)}
                  >
                    <Icon color="black900" name="close" />
                  </Button> */}
                  <Div>
                  <Text 
                    textAlign="center" 
                    fontSize="6xl" 
                    mt={100}
                  >
                    Are you sure?
                  </Text>
                    <Div 
                      row mt={150}
                    >
                        <Button 
                          flex={1} 
                          m={50} 
                          bg="red" 
                          onPress={() => logOut()}
                        >
                          Yes
                        </Button>
                        <Button 
                          flex={1} 
                          m={50} 
                          onPress={() => setVisible(false)} 
                        >
                          Cancel
                        </Button>
                    </Div>
                  </Div>
                </Modal>
            </Div>
          )
}


export default LogOut

