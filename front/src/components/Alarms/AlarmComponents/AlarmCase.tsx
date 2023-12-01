import React, { useRef} from "react"
import { Menu, MenuButton, MenuList, Button, MenuItem, Center} from "@chakra-ui/react"
import { ChevronDownIcon as Down } from  '@chakra-ui/icons'
import useAlarm from './alarmStates'
import { AlarmCases }  from "../../../type"
import { capitalize, enumValues } from "../../../utils"

function AlarmCase() {
  const alarmCase = useAlarm((state) => state.occurrence)
  const setAlarmCase = useAlarm((state) => state.setOccurrence)
  const cases = enumValues(AlarmCases)
  const inputTime = useRef<number>(Date.now())

  function mouseSelect(e: number) {
    const now = Date.now();
    if (now - inputTime.current < 200) {
      return;
    }
    inputTime.current = now;
    let index = cases.indexOf(alarmCase);
    if (e < 0 && index + 1 < cases.length) {
      setAlarmCase(cases[index + 1]);
    }
    if (e > 0 && index > 0) {
      setAlarmCase(cases[index - 1]);
    }
  }
  function alarmCases() {

    return cases.map(item => {
      return (
        <MenuItem
          onClick={() => setAlarmCase(item)}
          key={item}
        >
          {capitalize(item)}
        </MenuItem>
      );
    }
    );
  }
  return (
    <Center mb={'15px'}>
      <Menu
        matchWidth={true}
      >
        <MenuButton
          as={Button}
          rightIcon={<Down />}
          onWheel={e => mouseSelect(e.deltaY)}
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