import React, {useContext, createRef} from "react";
import { AlarmComponentsContext } from "./AlarmComponentsContext";
import { Dropdown, Button, Text } from "react-native-magnus";



const AlarmCase = (props) => {
    const dropdownRef = createRef();
    const { alarmCase, setAlarmCase} = useContext(AlarmComponentsContext);

    return(
        <>          
          <Button
            block
            mt="sm"
            p="md"
            color="white"
            onPress={() => dropdownRef.current.open()}>
            <Text>Select Alarm type: {alarmCase}</Text>
          </Button>
          <Dropdown
             ref={dropdownRef}
             m="md"
            pb="md"
            bg="transparent"
            showSwipeIndicator={false}
            roundedTop="xl"
          >
            <Dropdown.Option
              block
              bg="gray100"
              color="blue600"
              py="lg"
              px="xl"
              borderBottomWidth={1}
              borderBottomColor="gray200"
              justifyContent="center"
              onPress={() =>  setAlarmCase('once')}
            >
              Once
            </Dropdown.Option>
            <Dropdown.Option
              block
              bg="gray100"
              color="blue600"
              py="lg"
              px="xl"
              borderBottomWidth={1}
              borderBottomColor="gray200"
              justifyContent="center"
              onPress={() =>  setAlarmCase('daily')}
            >
              Daily
            </Dropdown.Option>
            <Dropdown.Option
              block
              bg="gray100"
              color="blue600"
              py="lg"
              px="xl"
              borderBottomWidth={1}
              borderBottomColor="gray200"
              justifyContent="center"
              onPress={() =>  setAlarmCase('weekly')}
            >
              Weekly
            </Dropdown.Option>
            <Dropdown.Option
              block
              bg="gray100"
              color="blue600"
              py="lg"
              px="xl"
              borderBottomWidth={1}
              borderBottomColor="gray200"
              justifyContent="center"
              onPress={() =>  setAlarmCase('yearly')}
            >
              Yearly
            </Dropdown.Option>
          </Dropdown>
         </>
    )
}

export default AlarmCase;