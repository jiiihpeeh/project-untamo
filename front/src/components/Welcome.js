import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
//import axios from 'axios'
import playAudio from './playAudio';

import { fetchAudioFiles } from '../audiostorage/audioDatabase'; 
import DeviceSelector from "./DeviceSelector";

import { SessionContext } from "../contexts/SessionContext";
import { DeviceContext } from "../contexts/DeviceContext";

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
import AddDevice from "./AddDevice";



const Welcome = () => {
    const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);
    const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
    const  navigate = useNavigate()

    useEffect(() => {
        const alarmResources = async () => {
            await fetchAudioFiles(token)
            playAudio('rooster', token)
        }
        if(sessionStatus){
            alarmResources()
        } else {
            navigate('/login')
        }
    },[])
	useEffect(() =>{
		if(!sessionStatus){
			navigate('/login')
		}
	},[sessionStatus])
    const SelectLayout = () => {
        if(!devices || devices.length === 0){
            return <Text><AddDevice/> </Text>
        }else {
            return <Text><DeviceSelector/> or <AddDevice/> </Text>
        }
    }
    useEffect(() => {
        SelectLayout()
    },[devices])
    return(
        <>
            <div>
                <Text>Tere tere, <Text as='b'>{userInfo.screenname}</Text> !</Text>
            </div>
            <div>
                <SelectLayout/>
            </div>
        </>
    )
}

export default Welcome;