import React, { useRef } from 'react'
import { Menu, MenuButton, MenuItem, MenuList, Button } from '@chakra-ui/react'
import { capitalize } from '../utils'
import { ChevronDownIcon as Down } from  '@chakra-ui/icons'


interface EnumMenuProps<T extends { toString(): string }> {
  options: T[];
  selectedOption: T;
  setOption: (option: T) => void;
  sizeKey: string; 
  capitalizeOption: boolean;
  prefix: string;
}

function EnumToMenu<T extends { toString(): string }>({
    options,
    selectedOption,
    setOption,
    sizeKey  = "md",
    capitalizeOption = true,
    prefix = "",
}: EnumMenuProps<T>) {
  const inputTime = useRef<number>(Date.now())

  function mouseSelect(e: number) {
    const now = Date.now();
    if (now - inputTime.current < 200) {
      return;
    }
    inputTime.current = now;
    let index = options.indexOf(selectedOption);
    if (e < 0 && index + 1 < options.length) {
      setOption(options[index + 1]);
    }
    if (e > 0 && index > 0) {
      setOption(options[index - 1]);
    }
  }

  function renderMenuItems() {
    return options.map((option) => (
      <MenuItem 
        key={option.toString()} 
        onClick={() => setOption(option)}
      >
        {`${prefix}  ${capitalizeOption ? capitalize(option.toString()): option.toString()}`. trim()}
      </MenuItem>
    ))
  }

  return (
    <Menu matchWidth size={sizeKey}>
      <MenuButton 
        as={Button} 
        width="100%" 
        size={sizeKey}
        onWheel={(e) => mouseSelect(e.deltaY)}
        rightIcon={<Down />}
      >
        {capitalizeOption ? capitalize(selectedOption.toString()): selectedOption.toString()}
      </MenuButton>
      <MenuList 
        width="100%"
      >
        {renderMenuItems()}
      </MenuList>
    </Menu>
  )
}

export default EnumToMenu