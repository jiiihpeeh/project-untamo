import React, { useEffect, useState } from "react";


import DeviceSelector from "./Devices/DeviceSelector";
import { Button, Icon, Div,Text, Input, Image, Modal, Dropdown } from 'react-native-magnus';
import AddDevice from "./Devices/AddDevice";

const Welcome = () => {

    return(
        <>  
        {/* <Div> */}
                <DeviceSelector/>
                <Text 
                    textAlign='center' 
                    m={10}
                > 
                    or 
                </Text>
                <AddDevice/>
            {/* </Div> */}
        </>
    )
}

export default Welcome;