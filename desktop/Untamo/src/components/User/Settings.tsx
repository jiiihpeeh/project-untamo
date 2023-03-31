import {    Modal,ModalOverlay,ModalContent,ModalHeader,
            ModalFooter, ModalBody, HStack,
            ModalCloseButton, RadioGroup, Radio,
            Button, Table,Thead, Tbody,Tr,Th,Td, Box,
            Slider,SliderTrack, SliderFilledTrack,
            SliderThumb} from '@chakra-ui/react'
import React from 'react'
import { usePopups, useSettings  } from '../../stores'
import TimeFormat from './TimeFormat'
import CloseTaskMenu from './CloseTaskMenu'
import PressSnoozeSlider from './PressSnoozeSlider'

const Settings = () => {
    const setShowSettings = usePopups((state)=> state.setShowSettings)
    const showSettings = usePopups((state)=> state.showSettings)
    const setShowColors = usePopups((state)=> state.setShowColor)

    const navBarTop = useSettings((state) => state.navBarTop)
    const setNavBarTop = useSettings((state) => state.setNavBarTop)
    const panelSize = useSettings((state) => state.height)
    const setPanelSize = useSettings((state) => state.setPanelSize)
    const alarmOnTop = useSettings((state) => state.alarmOnTop)
    const setAlarmOnTop = useSettings((state) => state.setAlarmOnTop)
    const setShowClearSettings = usePopups((state) => state.setShowClearSettings)

    return (
            <Modal 
                isOpen={showSettings} 
                onClose={()=>setShowSettings(false)}
                isCentered
                scrollBehavior='outside'
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Settings
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table
                            size="md"
                        >
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
                                        Panel Size
                                    </Td>
                                    <Td>
                                        <Slider 
                                            defaultValue={panelSize} 
                                            min={25} 
                                            max={80} step={1}
                                            onChange={(e)=>setPanelSize(e)}    
                                        >
                                            <SliderTrack >
                                                <Box 
                                                    position='relative' 
                                                    right={10} 
                                                />
                                                    <SliderFilledTrack/>
                                            </SliderTrack>
                                            <SliderThumb 
                                                boxSize={5}
                                                backgroundColor={"blue.700"}
                                            />
                                        </Slider>
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
                                <Tr>
                                    <Td>
                                        Press time for snooze (ms)
                                    </Td>
                                    <Td>
                                        <PressSnoozeSlider/>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        Close Task
                                    </Td>
                                    <Td>
                                        <CloseTaskMenu/>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        Clear Settings (Log Out)
                                    </Td>
                                    <Td>
                                        <Button
                                            onClick={()=> setShowClearSettings(true)}
                                        >
                                            Clear Settings
                                        </Button>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>Alarm on Top</Td>
                                    <Td>
                                    <RadioGroup>
                                            <HStack>
                                                <Radio 
                                                    isChecked={alarmOnTop} 
                                                    onChange={()=>setAlarmOnTop(!alarmOnTop)}
                                                >
                                                    Yes
                                                </Radio>
                                                <Radio 
                                                    isChecked={!alarmOnTop} 
                                                    onChange={()=>{setAlarmOnTop(!alarmOnTop)}}
                                                >
                                                    No
                                                </Radio>
                                            </HStack>
                                        </RadioGroup>
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
    
                    </ModalBody>
                    {/* <ModalFooter>
                    <Button 
                        colorScheme='blue' 
                        mr={3} 
                        onClick={()=>setShowSettings(false)}
                    >
                        OK
                    </Button>
                    </ModalFooter> */}
                </ModalContent>
            </Modal>
    )
}

export default Settings