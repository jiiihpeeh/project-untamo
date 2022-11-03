import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DeviceSelector from "./DeviceSelector";
import { SessionContext } from "../contexts/SessionContext";
import { DeviceContext } from "../contexts/DeviceContext";
import {
    Text,
    Grid,
    GridItem
  } from '@chakra-ui/react';
import AddDevice from "./AddDevice";
import AudioPlayer from "./AudioPlayer";


const Welcome = () => {
    const { token, userInfo, sessionStatus, server } = useContext(SessionContext);
    const { currentDevice, devices } = useContext(DeviceContext);
    const  navigate = useNavigate();
    
    const DeviceLayout = () => {
        if(!devices || devices.length === 0){
            return(<Grid>
                    <GridItem>
                        <AddDevice/> 
                    </GridItem>
                </Grid>
            );
        }else {
            return(
                    <Grid>
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
        };
    };
	useEffect(() =>{
		if(!sessionStatus){
			navigate('/login');
		}
        const welcome = async () => {
            let audiotrack = new AudioPlayer('rooster', token, server);
            await audiotrack.playOnce();
        }
        welcome()
	},[sessionStatus, navigate, token]);

    useEffect(() => {

    },[devices]);
    useEffect(() =>{
        if(currentDevice){
            navigate('/alarms');
        }
    },[currentDevice, navigate]);
    return(
        <>
                <Text>Tere tere, <Text as='b'>{userInfo.screenname}</Text> !</Text>

                <DeviceLayout/>
        </>
    )
}

export default Welcome;