import { Center, 
        Checkbox, 
        HStack, 
        Text, 
        Table,
        Thead,
        Tbody,
        Tr,
        Th,
        Td,
        TableContainer } from "@chakra-ui/react";   
import React , {useContext } from 'react';
import { DeviceContext } from '../../contexts/DeviceContext';
import { AlarmComponentsContext } from "./AlarmComponentsContext";

const DeviceChecker = (props) => {
    const { devices } = useContext(DeviceContext);
    const {selectedDevices, setSelectedDevices} = useContext(AlarmComponentsContext);
    const deviceSelection = ( id) => {
        if(selectedDevices.includes(id)){
            setSelectedDevices(selectedDevices.filter(device => device !== id));
        }else {
            setSelectedDevices([...selectedDevices,id]);
        };
    };

    const DeviceLister = () => {
        let deviceList = [];
        for( const device of devices){
            deviceList.push( <Tr key={`deviceList-${device.id}`} >
                                <Td>
                                    <HStack>
                                        <Checkbox isChecked={selectedDevices.includes(device.id)} onChange={() => deviceSelection(device.id)} /> 
                                        <Text>{device.deviceName}</Text>
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
                    <DeviceLister/>
                </Tbody>
            </Table>
            </TableContainer>
        </Center>
        </>
    );
};
export default DeviceChecker;
