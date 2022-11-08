import { createRef } from "react";


import { Button, Dropdown, Text } from 'react-native-magnus';


const DeviceTypes = (props) => {
    const dropdownRef = createRef();
    return(<>
        <Button
            block
            mt="sm"
            p="md"
            color="white"
            onPress={() => dropdownRef.current.open()}
            >
            <Text>Select Device type: {props.deviceType}</Text>
        </Button>
        
        <Dropdown
        ref={dropdownRef}
        title={
            <Text mx="xl" color="gray500" pb="md">
            Select the type of your device
            </Text>
        }
        mt="md"
        pb="2xl"
        showSwipeIndicator={true}
        roundedTop="xl">
        <Dropdown.Option py="md" px="xl" block onPress={() => props.setDeviceType("Phone")}>
            Phone
        </Dropdown.Option>
        <Dropdown.Option py="md" px="xl" block  onPress={() => props.setDeviceType("Tablet")}>
            Tablet
        </Dropdown.Option>
        <Dropdown.Option py="md" px="xl" block  onPress={() => props.setDeviceType("Browser")}>
            Browser
        </Dropdown.Option>
        <Dropdown.Option py="md" px="xl" block onPress={() => props.setDeviceType("Desktop")}>
            Desktop
        </Dropdown.Option>
        <Dropdown.Option py="md" px="xl" block  onPress={() => props.setDeviceType("IoT")}>
            IoT
        </Dropdown.Option>
        <Dropdown.Option py="md" px="xl" block  onPress={() => props.setDeviceType("Other")}>
            Other
        </Dropdown.Option>
        </Dropdown></>)
    }

export default DeviceTypes;