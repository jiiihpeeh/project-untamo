import React, { useState } from "react"
import { Button, Icon, Div,Text,  Input, Image, Modal } from 'react-native-magnus'
import { useServer } from "../../stores"

const ServerAddress = () => {
    const [visible, setVisible] = useState(false)
    const server = useServer((state)=> state.address)
    const setServer = useServer((state)=> state.setAddress)

    return(
            <>
                <Button 
                    block m={10} 
                    onPress={() => setVisible(true)}
                    bg="green"
                >
                    Server Address
                </Button>
                    <Modal 
                        isVisible={visible}
                    >
                        <Input
                            placeholder="Server Address"
                            focusBorderColor="blue700"
                            onChangeText={text => setServer(text)} 
                            value={server}
                            mt={80}
                        />
                        <Button
                            block m={10}
                            onPress={
                                        () =>  {
                                                    setVisible(false)
                                                }
                                    }
                        >
                            OK
                        </Button>
                    </Modal>
            </>
            )
}

export default ServerAddress