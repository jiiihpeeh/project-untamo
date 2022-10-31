import React, {useContext} from "react";
import { AlarmComponentsContext } from "./AlarmComponentsContext";
import { Menu, MenuButton, MenuList, Button, MenuItem, Center} from "@chakra-ui/react";
import { ChevronDownIcon } from  '@chakra-ui/icons';
const AlarmCase = (props) => {
    const { alarmCase, setAlarmCase} = useContext(AlarmComponentsContext);
    return(
      <Center mb={'15px'} >
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Choose the alarm type: {alarmCase}
          </MenuButton>
          <MenuList>
            <MenuItem  onClick={() => setAlarmCase('once')} >Once</MenuItem>
            <MenuItem  onClick={() => setAlarmCase('daily')}  >Daily</MenuItem>
            <MenuItem  onClick={() => setAlarmCase('weekly')}>Weekly</MenuItem>
            <MenuItem  onClick={() =>  setAlarmCase('yearly')}>Yearly</MenuItem>
          </MenuList>
        </Menu>
      </Center>
    )
}

export default AlarmCase;