import React, { useLayoutEffect, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../contexts/SessionContext';
import { AlarmContext } from '../contexts/AlarmContext';
import { hasOrFetchAudio, getAudio } from '../audiostorage/audioDatabase';
import axios from 'axios';

import { Text, Image, IconButton, Switch, Stack, Spacer, Heading, FormLabel } from "@chakra-ui/react"
import '../App.css'


const PlayAlarm = () =>{
    const [clockSize, setClockSize] = useState(Math.min(window.innerWidth, window.innerHeight) * 0.35);
    const { runAlarm, alarms, setAlarms, runOtherSnooze, setRunOtherSnooze } = useContext(AlarmContext);
    const { token } = useContext(SessionContext);
    const {sessionStatus} = useContext(SessionContext);
    const [ audioURL, setAudioURL ] = useState(undefined);
    const [ info, setInfo ] = useState({label:'', time:''})
    
    useLayoutEffect(() => {
        function updateSize() {
            setClockSize(Math.min(window.innerWidth, window.innerHeight) * 0.35);
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    const navigate = useNavigate();
    
    const idToAlarm = (id) => {
        try{
            return alarms.filter(alarm => alarm._id === runAlarm)[0];
        }catch(err){
            return null
        }
    }
    const alarmInfo = (id) => {
        let alarm = idToAlarm(id)
        if(alarm){
            setInfo(alarm);
        }else{
            setInfo({label:'', time:''});
        }
    }
    const removeAlarmObject = () => {
        try{
            clearTimeout(JSON.parse(sessionStorage.getItem('alarm-timeout')));
        }catch(err){};
        
        let aElem = document.getElementById('playAudioAlarm');
        if(aElem){
            aElem.pause();
            if(audioURL){
                URL.revokeObjectURL(audioURL);
                setAudioURL(undefined);
            };
        };
    }
    const snoozer = async () =>{
        let currentAlarm = idToAlarm(runAlarm);
        if(currentAlarm){
            let currentMoment = Date.now();
            if(currentAlarm.hasOwnProperty('snooze')){
                currentAlarm.snooze = currentAlarm.snooze.filter(snooze => snooze > (currentMoment - (60 * 60 * 1000)));
                currentAlarm.snooze.push(currentMoment);
            }else{
                currentAlarm.snooze = [ currentMoment ];
            };
            try {
                let res = await axios.put('/api/alarm/'+runAlarm, currentAlarm, {headers:{token:token}});
                console.log(res.data);
            }catch(err){
                console.log("Couldn't update alarm info ", err);
            };
            let filterAlarms = alarms.filter(alarm => alarm._id !== runAlarm);
            filterAlarms.push(currentAlarm);
            setAlarms(filterAlarms);
            localStorage.setItem('alarms', JSON.stringify(filterAlarms));
            removeAlarmObject();
            navigate('/alarms'); 
        }; 
     };
    
 
    const turnOff = async (event) => {
        console.log(event);
        
        let currentAlarm = idToAlarm(runAlarm);
        if(currentAlarm){
            currentAlarm.snooze = [0];
            try {
                let res = await axios.put('/api/alarm/'+runAlarm, currentAlarm,  {headers:{token:token}});
                console.log(res.data);
            }catch(err){
                console.log("Couldn't update alarm info ", err);
            }
            let filterAlarms = alarms.filter(alarm => alarm._id !== runAlarm);
            filterAlarms.push(currentAlarm);
            setAlarms(filterAlarms);
            localStorage.setItem('alarms', JSON.stringify(filterAlarms));
            removeAlarmObject();
            //navigate('/alarms');   
            setTimeout(() => {navigate('/alarms')},100);   
        };
    };

    useEffect(() =>{
        if(!sessionStatus){
            navigate('/login');
        }
    },[])
    // useEffect(() =>{
    //     const goAway = (id) =>{
    //         console.log('TIMEOUT!!!!!!!!!!! ')
    //         if(window.location.pathname === '/playalarm/' && (id === runAlarm._id)){
    //             let alarmCurrent = alarms.filter(alarm => alarm._id === id)
    //             let timeNow = new Date().getTime();
    //             if(alarmCurrent.length === 1 && (timeNow - Math.max(...alarmCurrent[0].snooze) > 95 * 6 * 1000 )){
    //                 snoozer();
    //             }
    //         }
    //     }
    //    let timeout = setTimeout(() => goAway(runAlarm._id), 10* 60* 1000);
    //    sessionStorage.setItem('alarm-timeout', JSON.stringify(timeout));
    // },[])
    useEffect(() => {
        if(runOtherSnooze){
            navigate('/alarms');
            removeAlarmObject();
            setRunOtherSnooze(false);
        };
    }, [runOtherSnooze]);

    useEffect(() => {
        const setAudio = async () => {
            let aElem = document.getElementById('playAudioAlarm');
            if(aElem){
                let tracked = await hasOrFetchAudio('rooster', token);
                if(tracked){
                    let data =  await getAudio('rooster');
                    let aURL = URL.createObjectURL(data);
                    setAudioURL(aURL);
                }
            }
        }
        setAudio();
    },[runAlarm, setAudioURL, token]);

    useEffect(() => {
        let aElem = document.getElementById('playAudioAlarm');
        if(aElem){
            aElem.play();
        };
    }, [audioURL])

    useEffect(() => {
        alarmInfo(runAlarm);
    }, [runAlarm])

    return(
        <>
        <Stack align='center'>
            <audio id="playAudioAlarm" loop={true} type='audio/ogg' src={audioURL}/>
            <Heading as="h1" size='4xl' color='tomato'  textShadow='2px 4px #ff0000' className='AlarmMessage'>
                {info.label}  <Text fontSize='sm' textShadow='1px 1px #ff0000' >({info.time}) </Text>
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
                <Image src='/alarm-clock.svg'  width='60%'/>
            </IconButton>
            <Spacer />
            <FormLabel mb='0'>
                    <Text as='b'>Turn alarm OFF</Text>
            </FormLabel>
            <Switch size='lg' onChange={turnOff}/>
        </Stack>
        </> 
    )
};
export default PlayAlarm;
