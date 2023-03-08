import { Drawer, Button, Icon, Text, Div } from 'react-native-magnus'
import React from 'react'
import DeviceSelector from "./Devices/DeviceSelector"
import AddDevice from './Devices/AddDevice'
import LogOut from './User/LogOut'
import EditDevice from './Devices/EditDevice'
const EditDrawer = () => {
    const drawerRef : any = React.createRef()
    return(<>
        <Drawer ref={drawerRef} >
            <Div 
                alignItems="center"
                mt={50}
            >
                <DeviceSelector/>
                <AddDevice/>
                <EditDevice/>
                <LogOut/>
            </Div>
            
        </Drawer>
        

        <Button 
            bg="teal" 
            h={40} 
            w={40} 
            m={10} 
            rounded="circle"
            onPress={() => {
                    if (drawerRef.current) {
                        drawerRef.current.open()
                    }
                }}
        >
            <Icon 
                name="setting" 
                color="white" 
            />
        </Button>
    </>)

}
export default EditDrawer