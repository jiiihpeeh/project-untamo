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

const DeviceChecker = (props) => {
    const { devices } = useContext(DeviceContext);
    
    const deviceSelection = ( id) => {
        if(props.selectedDevices.includes(id)){
            props.setSelectedDevices(props.selectedDevices.filter(device => device !== id));
        }else {
            props.setSelectedDevices([...props.selectedDevices,id]);
        };
    };
    const isSelected = (id) =>{
        if(props.selectedDevices.includes(id)){
            return true;
        }
        return false;
    };
    const DeviceLister = () => {
        let deviceList = [];
        for( const device of devices){
            deviceList.push( <Tr key={`deviceList-${device.id}`} >
                                <Td>
                                    <HStack>
                                        <Checkbox isChecked={isSelected(device.id)} onChange={() => deviceSelection(device.id)} /> 
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
