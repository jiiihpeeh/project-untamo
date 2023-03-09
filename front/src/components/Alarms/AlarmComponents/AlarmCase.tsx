import React from "react";
import { Menu, MenuButton, MenuList, Button, MenuItem, Center} from "@chakra-ui/react";
import { ChevronDownIcon } from  '@chakra-ui/icons';
import useAlarm, { AlarmCases } from './alarmStates'

const AlarmCase = () => {
    const alarmCase = useAlarm((state)=> state.occurence);
    const setAlarmCase = useAlarm((state)=> state.setOccurence)

    function capitalizeFirstLetter(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const alarmCases = () => {
      const cases = Object.values(AlarmCases).filter((item) => item)
      return cases.map(item => 
                        {
                          return(
                                  <MenuItem  
                                    onClick={() => setAlarmCase(item)}
                                    key={item}
                                  >
                                    {capitalizeFirstLetter(item)}
                                  </MenuItem>
                                )
                        }
                      )
    }
    return(
      <Center mb={'15px'} >
        <Menu
          matchWidth={true}
        >
          <MenuButton 
            as={Button} 
            rightIcon={
                        <ChevronDownIcon />
                      }
          >
            Choose the alarm type: {alarmCase}
          </MenuButton>
          <MenuList>
            {alarmCases()}
          </MenuList>
        </Menu>
      </Center>
    )
}

export default AlarmCase;