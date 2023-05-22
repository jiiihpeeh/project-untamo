import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { View,} from 'react-native'
import { timePadding } from './stringifyDate-Time'
import { Button } from 'react-native-magnus'
import useAlarm, {PickerMode} from './alarmStates'
import React from 'react'

const DateModal = () => {
    const date = useAlarm((state)=> state.date)
    const setDate = useAlarm((state)=> state.setDate)
    const mode= useAlarm((state)=> state.pickerMode)
  
    const onChange = (event:  DateTimePickerEvent, selectedDate: Date) => {
      if(date){
          setDate(selectedDate)
      }
    }
    
    const show = () => {
      DateTimePickerAndroid.open(
                                    {
                                        value: date,
                                        onChange,
                                        mode: "date",
                                        is24Hour: true,
                                    }
                                )
    }

    const showFormat = () => {
        switch(mode){
            case PickerMode.Month:
                return `${timePadding(date.getDate())}.${timePadding(date.getMonth() + 1)}.${timePadding(date.getFullYear(),4)} `
            default:
                return `${timePadding(date.getDate())}.${timePadding(date.getMonth() + 1)}`
        }
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
          {showFormat()}
        </Button>
      </View>
    )
  }

  export default DateModal