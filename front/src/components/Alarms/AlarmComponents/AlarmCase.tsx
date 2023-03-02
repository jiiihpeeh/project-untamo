import React from "react";
import { Menu, MenuButton, MenuList, Button, MenuItem, Center} from "@chakra-ui/react";
import { ChevronDownIcon } from  '@chakra-ui/icons';
import useAlarm, { AlarmCases } from './alarmStates'

const AlarmCase = () => {
    const alarmCase = useAlarm((state)=> state.occurence);
    const setAlarmCase = useAlarm((state)=> state.setOccurence)
    return(
      <Center mb={'15px'} >
        <Menu
          matchWidth={true}
        >
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Choose the alarm type: {alarmCase}
          </MenuButton>
          <MenuList>
            <MenuItem  onClick={() => setAlarmCase(AlarmCases.Once)}>Once</MenuItem>
            <MenuItem  onClick={() => setAlarmCase(AlarmCases.Daily)} >Daily</MenuItem>
            <MenuItem  onClick={() => setAlarmCase(AlarmCases.Weekly)}>Weekly</MenuItem>
            <MenuItem  onClick={() =>  setAlarmCase(AlarmCases.Yearly)}>Yearly</MenuItem>
          </MenuList>
        </Menu>
      </Center>
    )
}

export default AlarmCase;