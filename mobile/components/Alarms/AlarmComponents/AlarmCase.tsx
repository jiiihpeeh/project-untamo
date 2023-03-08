import React, { createRef } from "react"
import { Dropdown, Button, Text } from "react-native-magnus"
import useAlarm from "./alarmStates"
import { AlarmCases } from "../../../type"
const AlarmCase = () => {
    const dropdownRef : any = createRef()
    const alarmCase = useAlarm((state)=>state.occurence)
    const setAlarmCase = useAlarm((state)=>state.setOccurence)

    const alarmCases = () => {
      const cases = Object.values(AlarmCases).filter((item) => item)
      
      return cases.map(item => 
                        {
                          return(
                                  <Dropdown.Option
                                      block
                                      bg="gray100"
                                      color="blue600"
                                      py="lg"
                                      px="xl"
                                      borderBottomWidth={1}
                                      borderBottomColor="gray200"
                                      justifyContent="center"
                                      onPress={() =>  setAlarmCase(item)}
                                      value=""
                                      key={item}
                                  >
                                    {item}
                                  </Dropdown.Option>
                                )
                        }
                      )
    }

    return(
        <>          
          <Button
            block
            p="md"
            color="white"
            m={3}
            mt={20}
            onPress={() => dropdownRef.current.open()}
          >
            <Text>
              Select Alarm type: {alarmCase}
            </Text>
          </Button>
          <Dropdown
            ref={dropdownRef}
            m="md"
            pb="md"
            bg="transparent"
            showSwipeIndicator={false}
            roundedTop="xl"
          >
            {alarmCases()}
          </Dropdown>
         </>
    )
}

export default AlarmCase