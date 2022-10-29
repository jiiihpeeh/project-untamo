import React from "react";

import { Menu, MenuButton, MenuList, Button, MenuItem, Center} from "@chakra-ui/react";
import { ChevronDownIcon } from  '@chakra-ui/icons';
const AlarmCase = (props) => {
    return(
      <Center mb={'15px'} >
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Choose the alarm type: {props.alarmCase}
          </MenuButton>
          <MenuList>
            <MenuItem  onClick={() => props.setAlarmCase('once')} >Once</MenuItem>
            <MenuItem  onClick={() => props.setAlarmCase('daily')}  >Daily</MenuItem>
            <MenuItem  onClick={() => props.setAlarmCase('weekly')}>Weekly</MenuItem>
            <MenuItem onClick={() => props.setAlarmCase('yearly')}>Yearly</MenuItem>
          </MenuList>
        </Menu>
      </Center>
    )
}

export default AlarmCase;