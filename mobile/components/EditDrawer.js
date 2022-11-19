import { Drawer, Button, Icon, Text, Div } from 'react-native-magnus';
import React from 'react';
import DeviceSelector from "./DeviceSelector"
import LogOut from './LogOut';

const EditDrawer = () => {
    const drawerRef = React.createRef();
    return(<>
        <Drawer ref={drawerRef} >
            <Div alignItems="center">
                <DeviceSelector/>
                <LogOut/>
            </Div>
            
        </Drawer>
        

        <Button bg="teal" h={40} w={40} m={10} rounded="circle"
                onPress={() => {
                    if (drawerRef.current) {
                    drawerRef.current.open();
                    }
                }}
        >
            <Icon name="setting" color="white" />
        </Button>
    </>)

}
export default EditDrawer;