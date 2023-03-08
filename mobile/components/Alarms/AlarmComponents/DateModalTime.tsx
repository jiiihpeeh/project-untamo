import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { View,} from 'react-native'
import { timePadding,  } from './stringifyDate-Time'
import { Button } from 'react-native-magnus'
import useAlarm from './alarmStates'
import React from 'react'

const DateModalTime = () => {
    const time = useAlarm((state)=> state.time)
    const setTime = useAlarm((state)=> state.setTime)

    const onChange = (event:  DateTimePickerEvent, date: Date) => {
      if(date){
          setTime(`${timePadding(date.getHours())}:${timePadding(date.getMinutes())}`)
      }
    }
    const show = () => {
        const dateTime = new Date
        const timeArray = time.split(":")
        dateTime.setHours(parseInt(timeArray[0]))
        dateTime.setMinutes(parseInt(timeArray[1]))
        DateTimePickerAndroid.open(
                                    {
                                        value: dateTime,
                                        onChange,
                                        mode: 'time',
                                        is24Hour: true,
                                    }
                                )
    }
      
    return (
      <View>
        <Button 
            onPress={()=>show()} 
            borderWidth={5} 
            borderColor="gray" 
            color='black' 
            bg="white"
          >
            {time}
        </Button>
      </View>
    )
  }

  export default DateModalTime