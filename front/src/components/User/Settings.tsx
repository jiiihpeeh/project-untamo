import {    Modal,ModalOverlay,ModalContent,ModalHeader,
            ModalFooter, ModalBody, HStack, Center, Switch,
            ModalCloseButton, RadioGroup, Radio, Spacer,
            Button, Table,Thead, Tbody,Tr,Th,Td, Box,
            Slider,SliderTrack, SliderFilledTrack,
            SliderThumb, IconButton, useColorMode} from '@chakra-ui/react'
import React, {useState, useRef, useEffect } from 'react'
import { usePopups, useSettings  } from '../../stores'
import TimeFormat from './TimeFormat'
import CloseTaskMenu from './CloseTaskMenu'
import PressSnoozeSlider from './PressSnoozeSlider'
import { AddIcon as Add, MinusIcon as Minus } from  '@chakra-ui/icons';
import { ColorMode } from '../../type'
import { dialogSizes as sizes } from '../../stores/settingsStore'

const Settings = () => {
    const setShowSettings = usePopups((state)=> state.setShowSettings)
    const showSettings = usePopups((state)=> state.showSettings)
    const setShowColors = usePopups((state)=> state.setShowColor)
    const navBarTop = useSettings((state) => state.navBarTop)
    const setNavBarTop = useSettings((state) => state.setNavBarTop)
    const panelSize = useSettings((state) => state.height)
    const setPanelSize = useSettings((state) => state.setPanelSize)
    const setShowClearSettings = usePopups((state) => state.setShowClearSettings)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state) => state.windowSize)
    const size = useSettings((state) => state.dialogSize)
    const setSize = useSettings((state) => state.setDialogSize)
    const maxSize = useRef(1)
    const { colorMode, toggleColorMode } = useColorMode()
    const setColorSetting = useSettings((state) => state.setColorMode)
    const setShowChangeColors = usePopups((state)=> state.setShowChangeColors)
    const volume = useSettings((state) => state.volume)
    const setVolume = useSettings((state) => state.setVolume)

    useEffect(()=>{
        if(windowSize.height < 740){
            setSize(0)
            maxSize.current = 0
        }else if(windowSize.height < 915){
            if(size === 2){
                setSize(1)
            }
            maxSize.current = 1
        }else{
            maxSize.current = isMobile?1:2
        }
    },[windowSize])
    useEffect(()=>{
        if(colorMode  === ColorMode.Light){
            setColorSetting(ColorMode.Light)
        }else{
            setColorSetting(ColorMode.Dark)
        }
    },[colorMode])
    return (
            <Modal 
                isOpen={showSettings} 
                onClose={()=>setShowSettings(false)}
                isCentered
                scrollBehavior='outside'
            >
                <ModalOverlay />
                <ModalContent
                    onMouseDown={e=>e.preventDefault()}
                >
                    <ModalHeader>
                        Settings
                        <IconButton
                            size='xs'
                            icon={<Add/>}
                            ml="4%"
                            colorScheme='blue'
                            aria-label=''
                            onClick= {() => {setSize(Math.min(maxSize.current, size +1))}}
                            isDisabled={size === maxSize.current}
                        />
                        <IconButton
                            size='xs'
                            icon={<Minus/>}
                            ml="4%"
                            colorScheme='blue'
                            aria-label=''
                            onClick= {() => {setSize(Math.max(0, size - 1 ))}}
                            isDisabled={size === 0}
                        />
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table
                            size={sizes.get(size)}
                            variant='unstyled'
                        >
                            <Tbody>
                            <Tr>
                                    <Td>
                                        Color Mode
                                    </Td>
                                    <Td>
                                        <Center>
                                            <RadioGroup
                                                size={sizes.get(size)}
                                            >
                                                <HStack>
                                                    <Radio 
                                                        isChecked={colorMode === ColorMode.Light } 
                                                        onChange={()=>{
                                                                        setShowChangeColors(true) 
                                                                        toggleColorMode()
                                                                    }
                                                                }
                                                    >
                                                        Light
                                                    </Radio>
                                                    <Spacer/>
                                                    <Radio 
                                                        isChecked={colorMode === ColorMode.Dark } 
                                                        onChange={()=>{
                                                                            setShowChangeColors(true) 
                                                                            toggleColorMode()
                                                                        }
                                                                    }                                                    
                                                    >
                                                        Dark
                                                    </Radio>
                                                </HStack>
                                            </RadioGroup>
                                        </Center>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        Toolbar Position
                                    </Td>
                                    <Td>
                                        <Center>
                                            <RadioGroup
                                                size={sizes.get(size)}
                                            >
                                                <HStack>
                                                    <Radio 
                                                        isChecked={navBarTop} 
                                                        onChange={()=>setNavBarTop(!navBarTop)}
                                                    >
                                                        Top
                                                    </Radio>
                                                    <Spacer/>
                                                    <Radio 
                                                        isChecked={!navBarTop} 
                                                        onChange={()=>setNavBarTop(!navBarTop)}
                                                    >
                                                        Bottom
                                                    </Radio>
                                                </HStack>
                                            </RadioGroup>
                                        </Center>
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
                                            max={80} 
                                            step={1}
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
                                        size={sizes.get(size)}
                                        width="100%"
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
                                            size={sizes.get(size)}
                                            width="100%"
                                        >
                                            Clear Settings
                                        </Button>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        Alarm volume
                                    </Td>
                                    <Td>
                                        <Slider 
                                            defaultValue={volume} 
                                            min={0} 
                                            max={1} 
                                            step={0.01}
                                            onChange={(e)=>setVolume(e)}    
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
                            </Tbody>
                        </Table>
    
                    </ModalBody>
                </ModalContent>
            </Modal>
    )
}

export default Settings
