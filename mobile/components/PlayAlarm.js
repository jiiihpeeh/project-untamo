import React, {  useState, useContext, useEffect, useRef } from 'react';
import { SessionContext } from '../context/SessionContext';
import { AlarmContext } from '../context/AlarmContext';
import { Audio } from 'expo-av';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Image, Button, Div, Modal, Toggle } from "react-native-magnus";

import { Animated, View, StyleSheet, SafeAreaView, Easing, TouchableHighlight } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// const PlayAlarm = () =>{
//     const [clockSize, setClockSize] = useState(Math.min(window.innerWidth, window.innerHeight) * 0.35);

//     const {sessionStatus, server} = useContext(SessionContext);
//     const [ audioURL, setAudioURL ] = useState(undefined);
//     const [ info, setInfo ] = useState({label:'', time:''})
    
//     useLayoutEffect(() => {
//         function updateSize() {
//             setClockSize(Math.min(window.innerWidth, window.innerHeight) * 0.35);
//         };
//         window.addEventListener('resize', updateSize);
//         updateSize();
//         return () => window.removeEventListener('resize', updateSize);
//     }, []);
//     const navigate = useNavigate();
    

//     const alarmInfo = (id) => {
//         let alarm = idToAlarm(id)
//         if(alarm){
//             setInfo(alarm);
//         }else{
//             setInfo({label:'', time:''});
//         }
//     }
//     const removeAlarmObject = () => {
//         try{
//             clearTimeout(JSON.parse(sessionStorage.getItem('alarm-timeout')));
//         }catch(err){};
        
//         let aElem = document.getElementById('playAudioAlarm');
//         if(aElem){
//             aElem.pause();
//             if(audioURL){
//                 URL.revokeObjectURL(audioURL);
//                 setAudioURL(undefined);
//             };
//         };
//     }

    
 



//     // useEffect(() =>{
//     //     const goAway = (id) =>{
//     //         console.log('TIMEOUT!!!!!!!!!!! ')
//     //         if(window.location.pathname === '/playalarm/' ){
//     //             let alarmCurrent = alarms.filter(alarm => alarm._id === runAlarm)
//     //             let timeNow = new Date().getTime();
//     //             if((alarmCurrent.length === 1) ){
//     //                 let maxSnooze = (Math.max(...alarmCurrent[0].snooze))?Math.max(...alarmCurrent[0].snooze):0

//     //                 (maxSnooze > (95 * 6 * 1000)
//     //                 snoozer();
//     //             }
//     //         }
//     //     }
//     //    let timeout = setTimeout(() => goAway(runAlarm), 10* 60* 1000);
//     //    sessionStorage.setItem('alarm-timeout', JSON.stringify(timeout));
//     // },[])
//     useEffect(() => {
//         if(runOtherSnooze){
//             navigate('/alarms');
//             removeAlarmObject();
//             setRunOtherSnooze(false);
//         };
//     }, [runOtherSnooze]);

//     useEffect(() => {
//         const setAudio = async () => {
//             let aElem = document.getElementById('playAudioAlarm');
//             if(aElem){
//                 let tracked = await hasOrFetchAudio('rooster', token);
//                 if(tracked){
//                     let data =  await getAudio('rooster');
//                     let aURL = URL.createObjectURL(data);
//                     setAudioURL(aURL);
//                 }
//             }
//         }
//         setAudio();
//     },[runAlarm, setAudioURL, token]);

//     useEffect(() => {
//         let aElem = document.getElementById('playAudioAlarm');
//         if(aElem){
//             aElem.play();
//         };
//     }, [audioURL])

//     useEffect(() => {
//         alarmInfo(runAlarm);
//     }, [runAlarm])

//     return(
//         <>
//         <Stack align='center'>
//             <audio id="playAudioAlarm" loop={true} type='audio/ogg' src={audioURL}/>
//             <Heading as="h1" size='4xl' color='tomato'  textShadow='2px 4px #ff0000' className='AlarmMessage'>
//                 {info.label}  <Text fontSize='sm' textShadow='1px 1px #ff0000' >({info.time}) </Text>
//             </Heading>
//             <Heading as='h3' size='md'>
//                 Snooze the Alarm by clicking the clock below
//             </Heading>

//             <IconButton  width={clockSize} 
//                          height={clockSize} 
//                          borderRadius="50%" 
//                          className="AlarmClock"
//                          bgGradient="radial-gradient(circle, rgba(145,201,179,1) 0%, rgba(9,9,121,1) 0%, rgba(108,27,160,0.7945378835127801) 0%, rgba(136,32,171,1) 30%, rgba(16,23,135,1) 73%, rgba(50,96,210,1) 99%, rgba(148,182,155,1) 100%, rgba(51,175,32,0.5312325613839286) 100%)"
//                          onClick={snoozer}>
//                 <Image src='/alarm-clock.svg'  width='60%'/>
//             </IconButton>
//             <Spacer />
//             <FormLabel mb='0'>
//                     <Text as='b'>Turn alarm OFF</Text>
//             </FormLabel>
//             <Switch size='lg' onChange={turnOff}/>
//         </Stack>
//         </> 
//     )
// };
// export default PlayAlarm;


const  PlayAlarm = (props) => {
  const [sound, setSound] = useState();

  const { runAlarm, alarms, setAlarms, runOtherSnooze, setRunOtherSnooze } = useContext(AlarmContext);
  const { token } = useContext(SessionContext);
  const playSound = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync( require('./rooster.mp3'), {isLooping: true } 
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }


  const idToAlarm = (id) => {
      try{
          return alarms.filter(alarm => alarm._id === runAlarm)[0];
      }catch(err){
          return null
      }
  }

  const snoozer = async () => {
    setTimeout(() => {props.setPlayAlarm(false)},100)
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
        let res = await axios.put(`${server}/api/alarm/`+runAlarm, currentAlarm, {headers:{token:token}});
        console.log(res.data);
      }catch(err){
        console.log("Couldn't update alarm info ", err);
      };
      let filterAlarms = alarms.filter(alarm => alarm._id !== runAlarm);
      filterAlarms.push(currentAlarm);
      setAlarms(filterAlarms);
      await AsyncStorage.setItem('alarms', JSON.stringify(filterAlarms));
    };
  };

  const turnOff = async (event) => {
    setTimeout(() => {props.setPlayAlarm(false)},100)
      
    let currentAlarm = idToAlarm(runAlarm);
      if(currentAlarm){
        currentAlarm.snooze = [0];
        try {
          let res = await axios.put(`${server}/api/alarm/`+runAlarm, currentAlarm,  {headers:{token:token}});
          console.log(res.data);
        }catch(err){
          console.log("Couldn't update alarm info ", err);
        }
        let filterAlarms = alarms.filter(alarm => alarm._id !== runAlarm);
        filterAlarms.push(currentAlarm);
        setAlarms(filterAlarms);
        await AsyncStorage.setItem('alarms', JSON.stringify(filterAlarms));  
      };
  };
  useEffect(() => {
    const soundToggle = async () => {
      if(props.playAlarm){
        await playSound();
      }
      else{
        try{
          await sound.stopAsync();
        }catch(err){
          console.log(err);
        }
        console.log("Bye");
      }
    }

    soundToggle();
  },[props.playAlarm])
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);



  return (
    <SafeAreaView style={{flex: 1}}>

      <Modal isVisible={props.playAlarm}>
      <Div alignItems='center' m={50} mt={40}>
        <Text fontWeight="bold" fontSize={64} color={'tomato'} textShadowRadius={2} textAlign={'center'}>Alarm</Text>
        <Button  h={480} 
                 w={480} 
                 rounded="circle"
                 onPress={snoozer}
        >
          <Image
            h={426}
            w={317}
            m={10}
            source={require('./alarm.png')}
          />
        </Button>
          <Text mt={15} style={{fontWeight: "bold"}}>Turn alarm OFF </Text>
          <Toggle onPress={turnOff}/>
      </Div>
        </Modal>
    </SafeAreaView>
  );
}



export default PlayAlarm;



