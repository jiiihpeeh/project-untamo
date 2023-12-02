import {    Modal,ModalOverlay,ModalContent,ModalHeader,
            ModalBody, Center, 
            ModalCloseButton,   
            Button, Table,Tbody,Tr,Td, Box,
            Slider,SliderTrack, SliderFilledTrack,
            SliderThumb, IconButton} from '@chakra-ui/react'
import {useRef, useEffect } from 'react'
import { usePopups, useSettings  } from '../../stores'
import PressSnoozeSlider from './PressSnoozeSlider'
import { AddIcon as Add, MinusIcon as Minus } from  '@chakra-ui/icons';
import { CloseTask, ColorMode } from '../../type'
import { dialogSizes as sizes, NotificationType} from '../../stores/settingsStore'
import EnumToMenu from '../EnumToMenu'
import { enumToObject, enumValues } from '../../utils'
import OptionsToRadio from '../OptionsToRadio'
import { useTheme } from  "./Theme"

function Settings() {
    const setShowSettings = usePopups((state) => state.setShowSettings)
    const showSettings = usePopups((state) => state.showSettings)
    const setShowColors = usePopups((state) => state.setShowColor)
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
    const volume = useSettings((state) => state.volume)
    const setVolume = useSettings((state) => state.setVolume)
    const notificationType = useSettings((state) => state.notificationType)
    const setNotificationType = useSettings((state) => state.setNotificationType)
    const closeTask = useSettings((state) => state.closeTask)
    const setCloseTask = useSettings((state) => state.setCloseTask)
    const clock24 = useSettings((state) => state.clock24)
    const setClock24 = useSettings((state) => state.setClock24)
    const theme = useTheme((state) => state.theme)
    const setTheme = useTheme((state) => state.setTheme)


    useEffect(() => {
        if (windowSize.height < 745) {
            setSize(0)
            maxSize.current = 0
        } else if (windowSize.height < 920) {
            if (size === 2) {
                setSize(1)
            }
            maxSize.current = 1
        } else {
            maxSize.current = isMobile ? 1 : 2
        }
    }, [windowSize])

    return (
        <Modal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            isCentered
            scrollBehavior='outside'
        >
            <ModalOverlay />
            <ModalContent
                onMouseDown={e => e.preventDefault()}
            >
                <ModalHeader>
                    Settings
                    <IconButton
                        size='xs'
                        icon={<Add />}
                        ml="4%"
                        colorScheme='blue'
                        aria-label=''
                        onClick={() => { setSize(Math.min(maxSize.current, size + 1)) } }
                        isDisabled={size === maxSize.current} />
                    <IconButton
                        size='xs'
                        icon={<Minus />}
                        ml="4%"
                        colorScheme='blue'
                        aria-label=''
                        onClick={() => { setSize(Math.max(0, size - 1)) } }
                        isDisabled={size === 0} />
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
                                        <OptionsToRadio
                                            options={enumToObject(ColorMode)}
                                            selectedOption={theme}
                                            setOption={setTheme}
                                            capitalizeOption={true}
                                            sizeKey={sizes.get(size) as string}
                                        />
                                    </Center>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>
                                    Toolbar Position
                                </Td>
                                <Td>
                                    <Center>
                                        <OptionsToRadio 
                                            options= {{ "Top": true, "Bottom": false}}
                                            setOption={setNavBarTop}
                                            selectedOption={navBarTop}
                                            capitalizeOption={true}
                                            sizeKey={sizes.get(size) as string}
                                        />
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
                                        onChange={(e) => setPanelSize(e)}
                                    >
                                        <SliderTrack>
                                            <Box
                                                position='relative'
                                                right={10} />
                                            <SliderFilledTrack />
                                        </SliderTrack>
                                        <SliderThumb
                                            boxSize={5}
                                            backgroundColor={"blue.700"} />
                                    </Slider>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>
                                    Alarm Colors
                                </Td>
                                <Td>
                                    <Button
                                        onClick={() => setShowColors(true)}
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
                                <Center>
                                        <OptionsToRadio
                                            options={{ "24 h": true, "12 h": false }}
                                            selectedOption={clock24}
                                            setOption={setClock24}
                                            capitalizeOption={true}
                                            sizeKey={sizes.get(size) as string}
                                        />
                                    </Center>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>
                                    Press time for snooze (ms)
                                </Td>
                                <Td>
                                    <PressSnoozeSlider />
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
                                        onChange={(e) => setVolume(e)}
                                    >
                                        <SliderTrack>
                                            <Box
                                                position='relative'
                                                right={10} />
                                            <SliderFilledTrack />
                                        </SliderTrack>
                                        <SliderThumb
                                            boxSize={5}
                                            backgroundColor={"blue.700"} />
                                    </Slider>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>
                                    Close Task
                                </Td>
                                <Td>
                                    {/* <CloseTaskMenu /> */}
                                    <EnumToMenu
                                        options={enumValues(CloseTask)}
                                        selectedOption={closeTask}
                                        setOption={setCloseTask}
                                        sizeKey={sizes.get(size) as string}
                                        capitalizeOption={true} 
                                        prefix={''}                                    />
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>
                                    Clear Settings (Log Out)
                                </Td>
                                <Td>
                                    <Button
                                        onClick={() => setShowClearSettings(true)}
                                        size={sizes.get(size)}
                                        width="100%"
                                    >
                                        Clear Settings
                                    </Button>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>
                                    Notification
                                </Td>
                                <Td>
                                    {/* <NotifyMenu /> */}
                                    <EnumToMenu
                                        options={enumValues(NotificationType)}
                                        selectedOption={notificationType}
                                        setOption={setNotificationType}
                                        sizeKey={sizes.get(size) as string}
                                        capitalizeOption={true} 
                                        prefix={''}                                    />
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
