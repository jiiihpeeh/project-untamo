import React, {  useState, useContext, useEffect, useRef } from 'react';
import { SessionContext } from '../context/SessionContext';
import { AlarmContext } from '../context/AlarmContext';
import { Audio } from 'expo-av';
import axios from 'axios';

import { Text, Image, Button, Div, Modal } from "react-native-magnus";

import { Animated, View, StyleSheet, SafeAreaView, Easing, TouchableHighlight } from 'react-native';
// const PlayAlarm = () =>{
//     const [clockSize, setClockSize] = useState(Math.min(window.innerWidth, window.innerHeight) * 0.35);
//     const { runAlarm, alarms, setAlarms, runOtherSnooze, setRunOtherSnooze } = useContext(AlarmContext);
//     const { token } = useContext(SessionContext);
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
    
//     const idToAlarm = (id) => {
//         try{
//             return alarms.filter(alarm => alarm._id === runAlarm)[0];
//         }catch(err){
//             return null
//         }
//     }
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
//     const snoozer = async () =>{
//         let currentAlarm = idToAlarm(runAlarm);
//         if(currentAlarm){
//             let currentMoment = Date.now();
//             if(currentAlarm.hasOwnProperty('snooze')){
//                 currentAlarm.snooze = currentAlarm.snooze.filter(snooze => snooze > (currentMoment - (60 * 60 * 1000)));
//                 currentAlarm.snooze.push(currentMoment);
//             }else{
//                 currentAlarm.snooze = [ currentMoment ];
//             };
//             try {
//                 let res = await axios.put(`${server}/api/alarm/`+runAlarm, currentAlarm, {headers:{token:token}});
//                 console.log(res.data);
//             }catch(err){
//                 console.log("Couldn't update alarm info ", err);
//             };
//             let filterAlarms = alarms.filter(alarm => alarm._id !== runAlarm);
//             filterAlarms.push(currentAlarm);
//             setAlarms(filterAlarms);
//             localStorage.setItem('alarms', JSON.stringify(filterAlarms));
//             removeAlarmObject();
//             navigate('/alarms'); 
//         }; 
//      };
    
 
//     const turnOff = async (event) => {
//         console.log(event);
        
//         let currentAlarm = idToAlarm(runAlarm);
//         if(currentAlarm){
//             currentAlarm.snooze = [0];
//             try {
//                 let res = await axios.put(`${server}/api/alarm/`+runAlarm, currentAlarm,  {headers:{token:token}});
//                 console.log(res.data);
//             }catch(err){
//                 console.log("Couldn't update alarm info ", err);
//             }
//             let filterAlarms = alarms.filter(alarm => alarm._id !== runAlarm);
//             filterAlarms.push(currentAlarm);
//             setAlarms(filterAlarms);
//             localStorage.setItem('alarms', JSON.stringify(filterAlarms));
//             removeAlarmObject();
//             //navigate('/alarms');   
//             setTimeout(() => {navigate('/alarms')},100);   
//         };
//     };


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


const  PlayAlarm = () => {
  const [sound, setSound] = useState();
  const [visible, setVisible] = useState(false);

  const playSound = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync( require('./rooster.mp3'), {isLooping: true } 
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);


    const fadeAnim = useRef(new Animated.Value(0)).current;
    const spinValue = new Animated.Value(0);
    const [animatePress, setAnimatePress] = useState(new Animated.Value(1))
    const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 3 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: true,
    }).start();
  };
    const rotate = () => {
    // Will change fadeAnim value to 0 in 3 seconds
    Animated.timing(spinValue, {
        toValue: 360,
        duration: 300000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start()
  };
  let rotateValueHolder = new Animated.Value(0);

  const startImageRotateFunction = () => {
    rotateValueHolder.setValue(0);
    Animated.timing(rotateValueHolder, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => startImageRotateFunction());
  };
  const rotateData = rotateValueHolder.interpolate({
    inputRange: [0,1],
    outputRange: ['-30deg', '30deg'],
  });



  return (
    <SafeAreaView style={{flex: 1}}>
            <Button block m={10} onPress={() => setVisible(true)}>
            Open Modal
            </Button>
      <Modal isVisible={visible}>

        <View style={styles.container}>
            <Text style={styles.titleText}>
            React Native Rotate Image View Using Animation
            </Text>
                <Button>
                    <Animated.Image
                    style={{
                        width: 200,
                        height: 200,
                        transform: [{rotate: rotateData}],
                    }}
                    source={{
                        uri:
                        'https://raw.githubusercontent.com/AboutReact/sampleresource/master/old_logo.png',
                    }}
                    />
                </Button>
            <TouchableHighlight
            onPress={startImageRotateFunction}
            style={styles.buttonStyle}>
            <Text style={styles.buttonTextStyle}>
                Start Image Rotate Function
            </Text>
            </TouchableHighlight>
        </View>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#C2C2C2',
    },
  
    titleText: {
      fontSize: 22,
      textAlign: 'center',
      fontWeight: 'bold',
      padding: 20,
    },
  
    textStyle: {
      textAlign: 'center',
      marginTop: 10,
    },
    buttonStyle: {
      fontSize: 16,
      color: 'white',
      backgroundColor: 'green',
      padding: 5,
      marginTop: 32,
      minWidth: 250,
    },
    buttonTextStyle: {
      padding: 5,
      color: 'white',
      textAlign: 'center',
    },
  });

export default PlayAlarm;






// import { Feather } from '@expo/vector-icons'
// import * as React from 'react'
// import { TextStyle, Animated, Easing } from 'react-native'

// import { Colors, FontSize } from '~/constants/Theme'

// export const LoadingSpinner = React.memo(
//   ({ color = Colors['sand'], size = FontSize['md'] - 1, fadeInDelay = 1000, ...props }: Props) => {
//     const fadeInValue = new Animated.Value(0)
//     const spinValue = new Animated.Value(0)

//     Animated.sequence([
//       Animated.delay(fadeInDelay),
//       Animated.timing(fadeInValue, {
//         toValue: 1,
//         duration: 1500,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       }),
//     ]).start()

//     Animated.loop(
//       Animated.timing(spinValue, {
//         toValue: 360,
//         duration: 300000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       })
//     ).start()

//     return (
//       <Animated.View
//         style={{
//           opacity: fadeInValue,
//           transform: [{ rotate: spinValue }],
//         }}
//       >
//         <Feather
//           name="loader"
//           size={size}
//           style={{
//             color,
//             alignSelf: 'center',
//           }}
//           {...props.featherProps}
//         />
//       </Animated.View>
//     )
//   }
// )

// type Props = {
//   color?: TextStyle['color']
//   size?: number
//   featherProps?: Partial<Omit<React.ComponentProps<typeof Feather>, 'style'>>
//   fadeInDelay?: number
// }


// import React, { useRef } from 'react';
// import { Animated, Text, View, StyleSheet, Button, SafeAreaView } from 'react-native';

// const App = () => {
  // fadeAnim will be used as the value for opacity. Initial Value: 0
  //const fadeAnim = useRef(new Animated.Value(0)).current;

//   const fadeIn = () => {
//     // Will change fadeAnim value to 1 in 5 seconds
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 5000,
//     }).start();
//   };

//   const rotate = () => {
//     // Will change fadeAnim value to 0 in 3 seconds
//     Animated.timing(spinValue, {
//         toValue: 360,
//         duration: 300000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       }).start()
//   };


 
//   return (
//     <SafeAreaView>
//       <Animated.View

//       </Animated.View>
   
//     </SafeAreaView>
//   );
// };
