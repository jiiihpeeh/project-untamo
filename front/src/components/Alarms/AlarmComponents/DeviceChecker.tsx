import { Center, Checkbox, HStack, Text, 
    Table,Thead, Tbody,Tr,Th,Td,TableContainer } from "@chakra-ui/react";   
import React from 'react';
import { useDevices } from "../../../stores";
import useAlarm from "./alarmStates";

const DeviceChecker = () => {
    const devices  = useDevices((state)=>state.devices);
    const selectedDevices = useAlarm((state) => state.devices);
    const toggleDevices = useAlarm((state)=> state.toggleDevices);

    const DeviceLister = (): Array<JSX.Element> => {
        let deviceList = [] as Array<JSX.Element>;
        for( const device of devices){
            deviceList.push( 
                            <Tr 
                                key={`deviceList-${device.id}`} 
                            >
                                <Td>
                                    <HStack>
                                        <Checkbox 
                                            isChecked={selectedDevices.includes(device.id)} 
                                            onChange={() => toggleDevices(device.id)} 
                                        /> 
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
                            );
        };
        return (
            deviceList 
        );
    };

    return(
        <>
        <Center>
            <TableContainer>
            <Table>
                <Thead>
                    <Tr>
                        <Th>Device</Th>
                        <Th>Type</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {DeviceLister()}
                </Tbody>
            </Table>
            </TableContainer>
        </Center>
        </>
    );
};
export default DeviceChecker;
