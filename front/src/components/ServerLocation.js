import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    Input, Text, Link,
    useDisclosure
  } from '@chakra-ui/react';
import React, {useState, useRef, useEffect, useContext} from 'react';
import { SessionContext } from '../contexts/SessionContext';
const ServerLocation = () => {
    const { server, setServer } = useContext(SessionContext);
    const { onOpen, onClose, isOpen } = useDisclosure()
    const firstFieldRef = useRef(null)
    useEffect(() => {
        console.log('server:', server)
    },[server])
    return (
      <>
        <Popover
          isOpen={isOpen}
          initialFocusRef={firstFieldRef}
          onOpen={onOpen}
          onClose={onClose}
          placement='bottom'
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Link>
                <Text as='b'>Server Address</Text>
            </Link>  
          </PopoverTrigger>
          <PopoverContent p={5}>
            <Input type="text" 
                    value={server} 
                    onChange={(e) => setServer(e.target.value)} 
                    />
          </PopoverContent>
        </Popover>
      </>)
}


export default ServerLocation;