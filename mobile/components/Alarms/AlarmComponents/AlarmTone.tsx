import React, { createRef } from "react"
import { Dropdown, Button, Text, Div, Icon } from "react-native-magnus"
import useAudio from '../../../stores/audioStore'
import useAlarm from './alarmStates'

const AlarmTone = () => {
    const dropdownRef : any = createRef()
    const tracks = useAudio((state)=>state.tracks)
    const fetchAlarms = useAudio((state)=>state.fetchTracks)
    const track = useAlarm((state =>state.tone))
    const setTrack = useAlarm((state =>state.setTone))


    const alarmCases = () => {
        let newTracks = tracks 
        if(tracks.length ===0){
            fetchAlarms()
        }
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
        <Div
            row={true}
        >          
            <Button
                block
                p="md"
                color="white"
                m={5}
                mt={20}
                bg="cyan"
                onPress={() => dropdownRef.current.open()}
            >
                <Text>
                    Select alarm track: <Text 
                                            color="blue"
                                        >
                                            {track}
                                        </Text> 
                </Text>
                <Button
                    bg="green"
                    h={36}
                    w={36}
                    mx="xl"
                    m={1}
                    rounded="circle"
                    shadow="md"
                    borderless
                    alignSelf="stretch"
                    onPress={()=>fetchAlarms()}
                >
                    <Icon 
                        name="retweet" 
                        color="white" 
                        fontFamily="AntDesign" 
                    />
                </Button>
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
        </Div>
    )
}
export default AlarmTone