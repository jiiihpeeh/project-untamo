import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DeviceSelector from "./DeviceSelector";
import { SessionContext } from "../contexts/SessionContext";
import { DeviceContext } from "../contexts/DeviceContext";
import AudioPlayer from "./AudioPlayer";
import {
    Text,
    Grid,
    GridItem
  } from '@chakra-ui/react';
import AddDevice from "./AddDevice";



const Welcome = () => {
    const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);
    const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
    const  navigate = useNavigate()


	useEffect(() =>{
		if(!sessionStatus){
			navigate('/login');
		} else{
            new AudioPlayer('rooster', token).playOnce()
        }
	},[sessionStatus])
    const SelectLayout = () => {
        if(!devices || devices.length === 0){
            return (<Grid>
                    <GridItem>
                        <AddDevice/> 
                    </GridItem>
                </Grid>
            );
        }else {
            return (<Grid>
                        <GridItem>
                            <DeviceSelector/>
                        </GridItem>
                        <GridItem>
                            <Text>
                                or 
                            </Text>
                        </GridItem>
                        <GridItem>
                            <AddDevice/>
                        </GridItem>
                    </Grid>
            );
        }
    };
    useEffect(() => {
        SelectLayout();
    },[devices]);
    useEffect(() =>{
        if(currentDevice){
            navigate('/alarms');
        }
    },[currentDevice]);
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