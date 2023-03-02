import React, { useState } from "react";
import { Menu, MenuButton, MenuList, Button, MenuItem, 
     Center, IconButton, Text, Icon, Tooltip, Table, Tr, Td, Tbody } from "@chakra-ui/react";
import { ChevronDownIcon } from  '@chakra-ui/icons';
import useAlarm from './alarmStates'
import { fetchAudioFiles } from '../../../audiostorage/audioDatabase'
import { RepeatIcon} from '@chakra-ui/icons'
import { BsFillPlayFill as PlayIcon} from 'react-icons/bs'
import { MdStop as StopIcon} from 'react-icons/md'
import { useAudio } from "../../../stores";

const AlarmTone = () => {
    const alarmTone = useAlarm((state)=> state.tone);
    const tones = useAudio((state)=> state.tracks)
    const track = useAudio((state)=> state.track)
    const plays = useAudio((state) => state.plays)
    const playAudio = useAudio((state) => state.play)
    const setTrack = useAudio((state)=>state.setTrack)
    const stopAudio = useAudio((state)=>state.stop)
    const setLoop = useAudio((state)=>state.setLoop)
    const [closeOnSelect, setCloseOnSelect ] = useState(false)
  
    const play = async (tone:string) =>{
        if(plays){
            stopAudio()
        }else{
            setLoop(false)
            setTrack(tone)
            playAudio()
        }
    }

    const menuTones = () => {
        if(tones.length === 0){
            fetchAudioFiles()
        }
        let modTones = tones
        if(!tones.includes(alarmTone)){
            modTones.push(alarmTone)
        }
        return modTones.map(tone => 
            { return (
                        <MenuItem 
                            onClick={()=> useAlarm.setState( { tone: tone })}
                            key={`audio-${tone}`}
                            w="100%"
                            closeOnSelect={closeOnSelect}
                        >   
                            <Table  
                                id={`alarm-${tone}`} 
                                key={`alarmKey-${tone}`} 
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
                                                {tone} 
                                            </Text>
                                        </Tooltip>
                                    </Td>
                                    <Td
                                        w="45px"
                                        onMouseLeave= {(e)=>{setCloseOnSelect(true)}}
                                        onMouseEnter={(e)=>{setCloseOnSelect(false)}}
                                        onClick={(e)=>{play(tone)}}
                                    >
                                        <Tooltip 
                                            label={(plays && (tone === track))?"Stop":'Play'}
                                            fontSize='sm'
                                        >
                                            <IconButton  
                                                icon={<Icon as={(plays && (tone === track) )?StopIcon:PlayIcon} />} 
                                                ml="5.5%" 
                                                colorScheme='cyan'
                                                aria-label=''
                                                size={"sm"}
                                                isDisabled={!tones.includes(tone) || (plays && (tone !== track) )}
                                            />
                                        </Tooltip>
                                    </Td>
                                </Tr>
                                </Tbody>
                            </Table>
                        </MenuItem>
                    )
            }
        )
    }

    return(
            <Center 
                mb={'15px'} >
            <Menu
                matchWidth={true}
            >
                <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                >
                    Choose the alarm tone: {alarmTone}
                </MenuButton>
                <MenuList>
                    {menuTones()}
                </MenuList>
            </Menu>
            <IconButton 
                size='xs' 
                icon={<RepeatIcon/>} 
                ml="5.5%" 
                colorScheme='blue'
                aria-label=''
                onClick= {() => {fetchAudioFiles()}}
            />
        </Center>
       )
}

export default AlarmTone;