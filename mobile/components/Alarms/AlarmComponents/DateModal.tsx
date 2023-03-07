import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import {
    View,
  } from 'react-native';
import { timePadding } from './stringifyDate-Time';
import { Button } from 'react-native-magnus';
const DateModal = (props) => {
    //const [date, setDate] = useState(props.date);
  
    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate;
      props.setDate(currentDate);
    };
  
    const showMode = (currentMode) => {
      DateTimePickerAndroid.open({
        value: props.date,
        onChange,
        mode: currentMode,
        is24Hour: true,
      });
    };
  
    const showDatepicker = () => {
      showMode('date');
    };
  
    const showTimepicker = () => {
      showMode('time');
    };
  
    return (
      <View>
        {props.mode === 'date' &&
        <Button onPress={showDatepicker} 
                borderWidth={5} 
                borderColor="gray" 
                color='black' bg="white">
                    {`${timePadding(props.date.getDate())}.${timePadding(props.date.getMonth() + 1)}.${props.date.getFullYear()}`}
        </Button>}
        {props.mode === 'date-no-year' &&
        <Button onPress={showDatepicker} 
                borderWidth={5} 
                borderColor="gray" 
                color='black' bg="white">
                    {`${timePadding(props.date.getDate())}.${timePadding(props.date.getMonth() + 1)}`}
        </Button>}
        {props.mode === 'time' &&
        <Button onPress={showTimepicker} 
                borderWidth={5} 
                borderColor="gray" 
                color='black' 
                bg="white">
                {`${timePadding(props.date.getHours())}:${timePadding(props.date.getMinutes())}`}
        </Button>}
      </View>
    );
  };


  export default DateModal