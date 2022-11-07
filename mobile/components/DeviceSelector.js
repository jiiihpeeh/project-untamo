import { useState, useEffect, useContext, createRef } from "react";
//import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../context/DeviceContext";

import { Dropdown, Button } from "react-native-magnus";
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeviceSelector = (props) => {

    const [openMenu, setOpenMenu] = useState(false)
    const [menuDevices, setMenuDevices] = useState()
    const { devices, currentDevice, setCurrentDevice} = useContext(DeviceContext);

    
    const dropdownRef = createRef();
    
    return (<>
          <Button
            block
            bg="pink500"
            mt="sm"
            p="md"
            color="white"
            onPress={() => dropdownRef.current.open()}>
            Open Dropdown
          </Button>

          <Dropdown
            ref={dropdownRef}
            title={
              <Text mx="xl" color="gray500" pb="md">
                This is your title
              </Text>
            }
            mt="md"
            pb="2xl"
            showSwipeIndicator={true}
            roundedTop="xl">
            <Dropdown.Option py="md" px="xl" block>
              First Option
            </Dropdown.Option>
            <Dropdown.Option py="md" px="xl" block>
              Second Option
            </Dropdown.Option>
            <Dropdown.Option py="md" px="xl" block>
              Third Option
            </Dropdown.Option>
          </Dropdown>
        </>
    )
}

export default DeviceSelector;