import React, { useState } from "react";
import { Menu, MenuButton, MenuList, Button, MenuItem, Center,
      IconButton, Text, Icon, Tooltip, Table, Tr, Td, Tbody } from "@chakra-ui/react";
import { ChevronDownIcon as Down } from  '@chakra-ui/icons';
import useAlarm from './alarmStates'
import { fetchAudioFiles } from '../../../stores/audioDatabase'
import { RepeatIcon} from '@chakra-ui/icons'
import { BsFillPlayFill as PlayIcon} from 'react-icons/bs'
import { MdStop as StopIcon} from 'react-icons/md'
import { useAudio } from "../../../stores";

function AlarmTune() {
    const alarmTune = useAlarm((state) => state.tune);
    const tunes = useAudio((state) => state.tracks);
    const track = useAudio((state) => state.track);
    const plays = useAudio((state) => state.plays);
    const playAudio = useAudio((state) => state.play);
    const setTrack = useAudio((state) => state.setTrack);
    const stopAudio = useAudio((state) => state.stop);
    const setLoop = useAudio((state) => state.setLoop);
    const [closeOnSelect, setCloseOnSelect] = useState(false);

    async function play(tune: string) {
        if (plays) {
            stopAudio();
        } else {
            setLoop(false);
            setTrack(tune);
            playAudio();
        }
    }

    function menuTones() {
        if (tunes.length === 0) {
            fetchAudioFiles();
        }
        let modTunes = tunes;
        if (!tunes.includes(alarmTune)) {
            modTunes.push(alarmTune);
        }
        return modTunes.map(tune => {
            return (
                <MenuItem
                    onClick={() => useAlarm.setState({ tune: tune })}
                    key={`audio-${tune}`}
                    w="100%"
                    closeOnSelect={closeOnSelect}
                >
                    <Table
                        id={`alarm-${tune}`}
                        key={`alarmKey-${tune}`}
                        variant="unstyled"
                        size="sm"
                        mb={"0px"}
                        mt={"0px"}
                    >
                        <Tbody>
                            <Tr>
                                <Td>
                                    <Tooltip
                                        label='Track name'
                                        fontSize='md'
                                    >
                                        <Text>
                                            {tune}
                                        </Text>
                                    </Tooltip>
                                </Td>
                                <Td
                                    w="45px"
                                    onMouseLeave={(e) => { setCloseOnSelect(true); } }
                                    onMouseEnter={(e) => { setCloseOnSelect(false); } }
                                    onClick={(e) => { play(tune); } }
                                >
                                    <Tooltip
                                        label={(plays && (tune === track)) ? "Stop" : 'Play'}
                                        fontSize='sm'
                                    >
                                        <IconButton
                                            icon={<Icon as={(plays && (tune === track)) ? StopIcon : PlayIcon} />}
                                            ml="5.5%"
                                            colorScheme='cyan'
                                            aria-label=''
                                            size={"sm"}
                                            isDisabled={!tunes.includes(tune) || (plays && (tune !== track))} />
                                    </Tooltip>
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </MenuItem>
            );
        }
        );
    }

    return (
        <Center
            mb={'15px'}>
            <Menu
                matchWidth={true}
            >
                <MenuButton
                    as={Button}
                    rightIcon={<Down />}
                    width="100%"
                >
                    Choose the alarm tune: {alarmTune}
                </MenuButton>
                <MenuList>
                    {menuTones()}
                </MenuList>
            </Menu>
            <IconButton
                size='xs'
                icon={<RepeatIcon />}
                ml="4%"
                colorScheme='blue'
                aria-label=''
                onClick={() => { fetchAudioFiles(); } } />
        </Center>
    );
}

export default AlarmTune;