import React, { createRef } from "react"
import { Dropdown, Button, Text } from "react-native-magnus"
import useAudio from '../../../stores/audioStore'
import useAlarm from './alarmStates'

const AlarmTone = () => {
    const dropdownRef : any = createRef()
    const tracks = useAudio((state)=>state.tracks)
    const track = useAlarm((state =>state.tone))
    const setTrack = useAlarm((state =>state.setTone))


    const alarmCases = () => {
        let newTracks = tracks 
        if(!tracks.includes(track)){
            newTracks.push(track)
        }

        return newTracks.map(item => 
                            {
                                return(
                                        <Dropdown.Option
                                            block
                                            bg="gray100"
                                            color="gray"
                                            py="lg"
                                            px="xl"
                                            borderBottomWidth={1}
                                            borderBottomColor="gray200"
                                            justifyContent="center"
                                            onPress={() =>  setTrack(item)}
                                            value=""
                                            key={item}
                                        >
                                            {item}
                                        </Dropdown.Option>
                                    )
                            }
                        )
    }
    
    return(
        <>          
            <Button
                block
                p="md"
                color="white"
                m={3}
                mt={20}
                bg="cyan"
                onPress={() => dropdownRef.current.open()}
            >
            <Text>
                Select a tone type: {track}
            </Text>
            </Button>
            <Dropdown
                ref={dropdownRef}
                m="md"
                pb="md"
                bg="transparent"
                showSwipeIndicator={false}
                roundedTop="xl"
            >
                {alarmCases()}
            </Dropdown>
        </>
    )
}
export default AlarmTone