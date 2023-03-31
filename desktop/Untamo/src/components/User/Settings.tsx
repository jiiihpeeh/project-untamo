import {    Modal,ModalOverlay,ModalContent,
            ModalHeader, ModalBody, HStack,
            ModalCloseButton, RadioGroup, Radio,
            Button, Table,Thead, Tbody,Tr,Th,Td, Box,
            Slider,SliderTrack, SliderFilledTrack,
            SliderThumb, IconButton} from '@chakra-ui/react'
import React, { useState } from 'react'
import { usePopups, useSettings } from '../../stores'
import TimeFormat from './TimeFormat'
import CloseTaskMenu from './CloseTaskMenu'
import PressSnoozeSlider from './PressSnoozeSlider'
import {  WindowTop } from '../../stores/settingsStore'
import { AddIcon as Add, MinusIcon as Minus } from  '@chakra-ui/icons';

const sizes = new Map<number, string>( [[0, "sm"], [1, "md"], [2, "lg"]])

const Settings = () => {
    const setShowSettings = usePopups((state)=> state.setShowSettings)
    const showSettings = usePopups((state)=> state.showSettings)
    const setShowColors = usePopups((state)=> state.setShowColor)

    const navBarTop = useSettings((state) => state.navBarTop)
    const setNavBarTop = useSettings((state) => state.setNavBarTop)
    const panelSize = useSettings((state) => state.height)
    const setPanelSize = useSettings((state) => state.setPanelSize)
    const onTop = useSettings((state) => state.onTop)
    const setOnTop = useSettings((state) => state.setOnTop)
    const setShowClearSettings = usePopups((state) => state.setShowClearSettings)
    const isMobile = usePopups((state) => state.isMobile)
    const [ size, setSize ] = useState(1)
    const maxSize = isMobile? 1:2
   
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
                        <IconButton 
                            size='xs' 
                            icon={<Add/>} 
                            ml="4%" 
                            colorScheme='blue'
                            aria-label=''
                            onClick= {() => {setSize(Math.min(maxSize, size +1 % 3))}}
                            isDisabled={size === maxSize}
                        />
                        <IconButton 
                            size='xs' 
                            icon={<Minus/>} 
                            ml="4%" 
                            colorScheme='blue'
                            aria-label=''
                            onClick= {() => {setSize(Math.max(0, size - 1 % 3))}}
                            isDisabled={size === 0}
                        />
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table
                            size={sizes.get(size)}
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
                                    <Td>On Top</Td>
                                    <Td>
                                    <RadioGroup>
                                            <HStack>
                                                <Radio 
                                                    isChecked={onTop === WindowTop.Always} 
                                                    onChange={()=>setOnTop(WindowTop.Always)}
                                                >
                                                    Always
                                                </Radio>
                                                <Radio 
                                                    isChecked={onTop === WindowTop.Alarm} 
                                                    onChange={()=>{setOnTop(WindowTop.Alarm)}}
                                                >
                                                    Alarm
                                                </Radio>
                                                <Radio 
                                                    isChecked={onTop === WindowTop.Never} 
                                                    onChange={()=>{setOnTop(WindowTop.Never)}}
                                                >
                                                    Never
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