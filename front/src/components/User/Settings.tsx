import {    Modal,ModalOverlay,ModalContent,ModalHeader,
            ModalFooter, ModalBody, HStack,
            ModalCloseButton, Text , RadioGroup, Radio,
            Button, Table,Thead, Tbody,Tr,Th,Td,TableContainer } from '@chakra-ui/react'
import React from 'react'
import { usePopups, useSettings } from '../../stores'
import TimeFormat from './TimeFormat'

const Settings = () => {
	const setShowSettings = usePopups((state)=> state.setShowSettings)
	const showSettings = usePopups((state)=> state.showSettings)
    const setShowColors = usePopups((state)=> state.setShowColor)

    const navBarTop = useSettings((state) => state.navBarTop)
    const setNavBarTop = useSettings((state) => state.setNavBarTop)

	return (
            <Modal 
                isOpen={showSettings} 
                onClose={()=>setShowSettings(false)}
                isCentered
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Settings
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>
                                        Setting
                                    </Th>
                                    <Th>
                                        Value
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>
                                        Toolbar Position
                                    </Td>

                                    <Td>
                                        <RadioGroup>
                                            <HStack>
                                                <Radio 
                                                    isChecked={navBarTop} 
                                                    onChange={()=>setNavBarTop(!navBarTop)}
                                                >
                                                    Top
                                                </Radio>
                                                <Radio 
                                                    isChecked={!navBarTop} 
                                                    onChange={()=>setNavBarTop(!navBarTop)}
                                                >
                                                    Bottom
                                                </Radio>
                                            </HStack>
                                        </RadioGroup>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        Alarm Colors
                                    </Td>
                                    <Td>    
                                    <Button
                                        onClick={()=>setShowColors(true)}
                                    >
                                        Set Alarm Colors
                                    </Button>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        Time Format
                                    </Td>
                                    <Td>
                                        <TimeFormat/>
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
    
                    </ModalBody>
                    <ModalFooter>
                    <Button 
                        colorScheme='blue' 
                        mr={3} 
                        onClick={()=>setShowSettings(false)}
                    >
                        OK
                    </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
    )
}

export default Settings