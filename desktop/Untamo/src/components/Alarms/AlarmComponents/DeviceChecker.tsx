import { Center, Checkbox, HStack, Text, Table,
         Thead, Tbody,Tr,Th,Td,TableContainer } from "@chakra-ui/react" 
import React from 'react'
import { useDevices } from "../../../stores"
import useAlarm from "./alarmStates"

function DeviceChecker() {
    const devices = useDevices((state) => state.devices)
    const selectedDevices = useAlarm((state) => state.devices)
    const toggleDevices = useAlarm((state) => state.toggleDevices)

    function deviceLister() {
        return devices.map(device => {
            return (
                <Tr
                    key={`deviceList-${device.id}`}
                >
                    <Td>
                        <HStack>
                            <Checkbox
                                isChecked={selectedDevices.includes(device.id)}
                                onChange={() => toggleDevices(device.id)}
                                size={"lg"} />
                            <Text>
                                {device.deviceName}
                            </Text>
                        </HStack>
                    </Td>
                    <Td>
                        <Text>
                            {device.type}
                        </Text>
                    </Td>
                </Tr>
            )
        }
        )
    }

    return (
        <Center
            onMouseDown={e => e.preventDefault()}
        >
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Device</Th>
                            <Th>Type</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {deviceLister()}
                    </Tbody>
                </Table>
            </TableContainer>
        </Center>
    )
}
export default DeviceChecker
