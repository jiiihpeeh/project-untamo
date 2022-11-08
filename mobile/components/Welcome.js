import { useEffect, useContext, useState } from "react";

import { DeviceContext } from "../context/DeviceContext";
import { SessionContext } from "../context/SessionContext";

import DeviceSelector from "./DeviceSelector";
import { Button, Icon, Div,Text, View, Input, Image, Modal, Dropdown } from 'react-native-magnus';
import AddDevice from "./AddDevice";

const Welcome = () => {
    const { token, userInfo, sessionStatus} = useContext(SessionContext);
    const { currentDevice, devices, setDevices } = useContext(DeviceContext);

    return(
        <>  
        {/* <Div> */}
                <DeviceSelector/>
                <Text textAlign='center' m={10}> or </Text>
                <AddDevice/>
            {/* </Div> */}
        </>
    )
}

export default Welcome;