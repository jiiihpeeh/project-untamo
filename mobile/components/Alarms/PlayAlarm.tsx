import React, {  useState, useContext, useEffect, useRef } from 'react';

import { Audio } from 'expo-av';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Image, Button, Div, Modal, Toggle } from "react-native-magnus";

import { Animated, View, StyleSheet, SafeAreaView, Easing, TouchableHighlight, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Logo from './logo.svg'

const  PlayAlarm = (props) => {
  const [sound, setSound] = useState();
  const [ currentAlarm, setCurrentAlarm] = useState({})


  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const radiusMax = Math.min(width/1.5, height/1.5);

  const playSound = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync( require('./rooster.mp3'), {isLooping: true } 
    );
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }



  const snoozer = async () => {
    setTimeout(() => {setAlarmWindow(false)},100)
    if(currentAlarm){
      let currentAlarmMod = Object.assign({}, currentAlarm)
      let currentMoment = Date.now();
      if(currentAlarm.hasOwnProperty('snooze')){
        currentAlarmMod.snooze = currentAlarmMod.snooze.filter(snooze => snooze > (currentMoment - (60 * 60 * 1000)));
        currentAlarmMod.snooze.push(currentMoment);
      }else{
        currentAlarmMod.snooze = [ currentAlarmMod ];
      };
      try {
        let res = await axios.put(`${server}/api/alarm/`+runAlarm, currentAlarmMod, {headers:{token:token}});
        console.log(res.data);
      }catch(err){
        console.log("Couldn't update alarm info ", err);
      };
      let filterAlarms = alarms.filter(alarm => alarm._id !== runAlarm);
      filterAlarms.push(currentAlarmMod);
      setAlarms(filterAlarms);
      try {
        await AsyncStorage.setItem('alarms', JSON.stringify(filterAlarms));
      }catch(err){
        console.log(err)
      }
      
    };
  };

  const turnOff = async (event) => {
    setTimeout(() => {setAlarmWindow(false)},100)
    if(currentAlarm){
      let currentAlarmMod = Object.assign({}, currentAlarm)
      currentAlarmMod.snooze = [0];
      try {
        let res = await axios.put(`${server}/api/alarm/`+runAlarm, currentAlarmMod,  {headers:{token:token}});
        console.log(res.data);
      }catch(err){
        console.log("Couldn't update alarm info ", err);
      }
      let filterAlarms = alarms.filter(alarm => alarm._id !== runAlarm);
      filterAlarms.push(currentAlarmMod);
      setAlarms(filterAlarms);
      try{
        await AsyncStorage.setItem('alarms', JSON.stringify(filterAlarms)); 
      }catch(err){
        console.log(err);
      }
       
    };
  };
  useEffect(() => {
    const soundToggle = async () => {
      if(alarmWindow){
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

  const idToAlarm = () => {
    try{
      setCurrentAlarm(alarms.filter(alarm => alarm._id === runAlarm)[0]);
    }catch(err){
      return null
    }
  }
  soundToggle();
  if(alarmWindow){
    idToAlarm();
  };
  },[alarmWindow])
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

      <Modal isVisible={alarmWindow}>
      <Div 
        alignItems='center' 
        mt={40}
      >
        <Text fontWeight="bold" 
              fontSize={64} 
              color={'tomato'} 
              textShadowRadius={2} 
              textAlign={'center'}>
                {currentAlarm.label}
        </Text>
        {/* <Button  
                h={480} 
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
        </Button> */}
        <Div alignItems='center' >
        {/* <TouchableHighlight onPress={() => snoozer()} >
          <View width={radiusMax} height={radiusMax} backgroundColor='#fff' > */}
          <Button width={radiusMax } height={radiusMax} onPress={() => snoozer()}  rounded="circle" bg="white" >
            <Logo  width={radiusMax * 4/3} height={radiusMax}/>
          </Button>
          {/* </View>
        </TouchableHighlight> */}
        </Div>
          <Text 
            mt={15} 
            fontWeight="bold"
          >
            Turn alarm OFF
          </Text>
          <Toggle onPress={turnOff}/>
      </Div>
        </Modal>
    </SafeAreaView>
  );
}



export default PlayAlarm;




