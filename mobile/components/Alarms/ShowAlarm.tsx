import React, { useState, useCallback } from "react";
import {setAlarm, cancelAlarm} from 'react-native-alarm-module';
import {View, Button, ToastAndroid, AppRegistry} from 'react-native';

// You have to register the task you would like executed as a headless task
AppRegistry.registerHeadlessTask('ShowToastTask', () => () => ToastAndroid.show('Alarm toast!', ToastAndroid.SHORT));

interface Props{
    showAlarm: boolean,
    setShowAlarm: (to:boolean) => void
}
const ShowAlarm = (props: Props) => {
    const [lastDate, setLastDate] = useState(new Date(Date.now() + 5 * 1000));

    const setAlarmOnPress = useCallback(() => {
      const newDate = new Date(Date.now() + 5 * 1000);
      setLastDate(newDate);
  
      setAlarm({
        taskName: 'ShowToastTask', // required
        timestamp: newDate.valueOf(), // required
        type: 'setAlarmClock', // optional
        allowedInForeground: true, // optional 
        wakeup: true, // optional
        extra: 'something extra', // optional
      });
  
      ToastAndroid.show(
        `alarm set for ${newDate.toISOString()}`,
        ToastAndroid.SHORT,
      );
    }, []);
  
    const cancel = useCallback(() => {
      cancelAlarm({
        taskName: 'ShowToastTask',
        timestamp: lastDate.valueOf(),
      });
      ToastAndroid.show(
        `alarm cancelled for ${lastDate.toISOString()}`,
        ToastAndroid.SHORT,
      );
    }, [lastDate]);
  
    return (
      <View>
        <Button onPress={setAlarmOnPress} title="Set Alarm in 5 seconds" />
        <Button onPress={()=>{cancel();props.setShowAlarm(false)}} title="Cancel last alarm" />
      </View>
    );
};

export default ShowAlarm