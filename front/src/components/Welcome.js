import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
//import axios from 'axios'
import playAudio from './playAudio'

import { fetchAudioFiles } from '../audiostorage/audioDatabase' 
import DeviceSelector from "./DeviceSelector";

import { SessionContext } from "../contexts/SessionContext"

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
    Text
  } from '@chakra-ui/react'



const Welcome = () => {
    const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);
    const  navigate = useNavigate()

    useEffect(() => {
        if(sessionStatus){
            fetchAudioFiles()
            playAudio('rooster')
        } else {
            navigate('/login')
        }
    },[sessionStatus])

    return(
        <>
            <div>
                <Text>Tere tere, <Text as='b'>{userInfo.screenname}</Text> !</Text>
            </div>
            <div>
                <DeviceSelector/>
            </div>
        </>
    )
}

export default Welcome;