import {  Popover, PopoverTrigger, Button, Portal, PopoverContent,
    PopoverHeader, PopoverArrow, PopoverBody, Link, Text, Center } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../stores'
import {Link as ReachLink} from 'react-router-dom'
import Countdown from "react-countdown"
import React, { useState, useEffect } from 'react'
import { timePadding } from '../Alarms/AlarmComponents/stringifyDate-Time'
import sleep from '../sleep'

const AdminPop = () =>{
    const adminTime = useAdmin((state) => state.time )
    const setAdminTime = useAdmin((state) => state.setTime)
    const setAdminToken = useAdmin((state)=> state.setToken)
    const navigate = useNavigate()

    
    interface TimeOutput{
        minutes: number,
        seconds: number
    }
    const timeOutput = ({ minutes, seconds,}: TimeOutput) => {
        return (<Text color={"red"} as ="b"> ({timePadding(minutes)}:{timePadding(seconds)})</Text>)
    }
   
    return(
            <Popover  >
                <PopoverTrigger>
                <Link>
                    <Text as="b" color={"red"}>
                        Admin 
                    </Text>
                    <Countdown  
                            date={adminTime}
                            renderer={timeOutput}
                    />
                </Link>
                </PopoverTrigger>
                <Portal>
                    <PopoverContent>
                    <PopoverArrow />
                    <PopoverHeader>
                        <Center>
                            Admin Info
                        </Center>
                    </PopoverHeader>
                    <PopoverBody>
                        <Center>
                            <Button 
                                onClick={()=>{setAdminToken(''); setAdminTime(0)}} 
                                //m="10px"
                                key="End-Admin"
                            >
                                End Admin Session
                            </Button>
                        </Center>
                    </PopoverBody>
                    </PopoverContent>
                </Portal>
            </Popover>        
    )
}

export default AdminPop