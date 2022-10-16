import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import { notification } from "./notification";

import { Input ,
    InputGroup,
    InputRightAddon,
    FormControl,
    FormLabel,
    Button,
    FormErrorMessage,
    FormHelperText,
    Box,
    } from '@chakra-ui/react';
import React, { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import fetchDevices from "./fetchDevices";
import fetchAlarms from "./fetchAlarms";
import { initAudioDB } from "../audiostorage/audioDatabase";
import { AlarmContext } from "../contexts/AlarmContext";


const LogIn = () => {
    const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);
    const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
    const { setAlarms}=useContext(AlarmContext)
    const [formData, setFormData] = useState({
        user: "",
        password: ""
    });
    const onChange = (event) => {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name] : event.target.value
            };
        })
    }

    const onSubmit = async (event) => {
        try{
            event.preventDefault();
            let res = await axios.post('/login', formData);
            await initAudioDB()

            console.log(res.data);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", res.data.user);
            localStorage.setItem("screenname", res.data.screenname);
            localStorage.setItem("firstname", res.data.firstname);
            localStorage.setItem("lastname", res.data.lastname);
            let userRes = Object.assign({}, res.data);
            delete userRes.token;
            setUserInfo(userRes);
            setToken(res.data.token);

            setDevices(await fetchDevices(res.data.token));
            setAlarms(await fetchAlarms(res.data.token));
            notification("Logged In", "Successfully logged in");
            setSessionStatus(true);
            
            navigate('/welcome');
            
        }catch(err){
            notification("Log In", "Log In Failed", "error");
            console.error(err);
        }

    }
    const navigate = useNavigate();

    useEffect(() =>{
        if(sessionStatus){
            navigate('/alarms')
        }
    },[sessionStatus])
    return (
        <Box bg='lightgray' width="30em" margin="0 auto"  borderRadius='lg'>
        <FormControl onSubmit={onSubmit} width="95%" margin="0 auto" >
            <FormLabel htmlFor="user">Email</FormLabel>
            <Input type="email"
                name="user"
                id="user"
                onChange={onChange}
                value={formData.user}
            />
            <FormLabel htmlFor='password'>Password</FormLabel>
            <Input type="password"
                name="password"
                id="password"
                onChange= {onChange}
                value={formData.password}
            />
            <Button type="submit" id="submit" onClick={onSubmit}>Log In </Button>
        </FormControl> 
        </Box>
    )
};

export default LogIn;
