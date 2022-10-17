import React, { useLayoutEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../contexts/SessionContext';
import AudioPlayer from './AudioPlayer';

import { 
         Text, 
         Image, 
         IconButton, 
         Switch, 
         Stack, 
         Spacer,
         Heading,
         FormLabel
          } from "@chakra-ui/react"
import '../App.css'


const PlayAlarm = () =>{
    const [clockSize, setClockSize] = useState(Math.min(window.innerWidth, window.innerHeight) * 0.35);
    useLayoutEffect(() => {
        function updateSize() {
            setClockSize(Math.min(window.innerWidth, window.innerHeight) * 0.35);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    const {token} = useContext(SessionContext);
    const navigate = useNavigate()
    const playAudio = new AudioPlayer('rooster', token);
    const snoozer = async () =>{
        console.log("clicked");
        await playAudio.playLoop();
    }
    
    const tellme = (event) => {
        console.log(event)
        playAudio.stopLoop();
        navigate('/alarms')
    }

    return(
        <>
        <Stack align='center'>
            <Heading as="h1" size='4xl' color='tomato'  textShadow='2px 4px #ff0000' className='AlarmMessage'>
                Alarm
            </Heading>
            <Heading as='h3' size='md'>
                Snooze the Alarm by clicking the clock below
            </Heading>

            <IconButton  width={clockSize} 
                         height={clockSize} 
                         borderRadius="50%" 
                         className="AlarmClock"
                         bgGradient="radial-gradient(circle, rgba(145,201,179,1) 0%, rgba(9,9,121,1) 0%, rgba(108,27,160,0.7945378835127801) 0%, rgba(136,32,171,1) 30%, rgba(16,23,135,1) 73%, rgba(50,96,210,1) 99%, rgba(148,182,155,1) 100%, rgba(51,175,32,0.5312325613839286) 100%)"
                         onClick={snoozer}>
                <Image src='http://localhost:3000/alarm-clock.svg'  width='60%'/>
            </IconButton>
            <Spacer />
            <FormLabel mb='0'>
                    <Text as='b'>Turn alarm OFF</Text>
            </FormLabel>
            <Switch size='lg' onChange={tellme}/>
      
        </Stack>
        </> 
    )
};
export default PlayAlarm;