import {  Popover, PopoverTrigger, Button, Portal, PopoverContent,
    PopoverHeader, PopoverArrow, PopoverBody, Link, Text, Center, PopoverAnchor, Box } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAdmin, usePopups } from '../../stores'
import React, { useState, useEffect } from 'react'
import { timePadding } from '../Alarms/AlarmComponents/stringifyDate-Time'
import sleep from '../sleep'

const AdminPop = () =>{
    const adminTime = useAdmin((state) => state.time )
    const setAdminTime = useAdmin((state) => state.setTime)
    const setAdminToken = useAdmin((state)=> state.setToken)
    const showAdminPop = usePopups((state)=> state.showAdminPop)
    const setShowAdminPop = usePopups((state)=> state.setShowAdminPop)

    const navigationTriggered = usePopups((state)=> state.navigationTriggered)
    const [ posStyle, setPosStyle ] = useState<React.CSSProperties>({})

    const navigate = useNavigate()

    useEffect(()=>{
        let elem = document.getElementById("link-admin")
        if(elem){
            let coords = elem.getBoundingClientRect()
            setPosStyle({left: coords.left  + coords.width/2, top: coords.top - coords.height +10, position:"absolute"})
        }
    },[navigationTriggered])
    return(
            <Popover  
                isOpen={showAdminPop}
                onClose={()=>setShowAdminPop(false)}
            >
            <PopoverAnchor>
                <Box style={posStyle}>
                </Box>
            </PopoverAnchor>
                <Portal >
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
                                onClick={()=>{setAdminToken(''); setAdminTime(0); setShowAdminPop(false)}} 
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