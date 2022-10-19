import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import { notification } from "./notification";

import { Input ,
    FormControl,
    FormLabel,
    Button,
    Box,
    Divider
    } from '@chakra-ui/react';
import React, { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import fetchDevices from "./fetchDevices";
import fetchAlarms from "./fetchAlarms";
import { initAudioDB, fetchAudioFiles } from "../audiostorage/audioDatabase";
import { AlarmContext } from "../contexts/AlarmContext";
import '../App.css'

const LogIn = () => {
    const {  setToken, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);
    const { setDevices, setViewableDevices } = useContext(DeviceContext);
    const { setAlarms}=useContext(AlarmContext)
    const [formData, setFormData] = useState({
        user: "",
        password: ""
    });
    const [ canSubmit, setCanSubmit ] = useState(false)
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
            
            fetchAudioFiles(res.data.token)
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
            let devices = await fetchDevices(res.data.token);
            setDevices(devices);
            let viewable = []
            for(const item of devices){
                viewable.push(item.id)
            }
            setViewableDevices(viewable);
            localStorage.setItem("devices", JSON.stringify(devices));
            localStorage.setItem("viewableDevices", JSON.stringify(viewable));
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
    },[sessionStatus, navigate])

    useEffect(()=>{
        const isOK = () => {
            if(formData.password.length > 5 && emailPattern.test(formData.user)){
                setCanSubmit(true);
            }else {
                setCanSubmit(false);
            }
        };
        const emailPattern = new RegExp(".+@.+..+");
        isOK();
    },[formData])
    return (
        <form>
        <Box className='UserForm'>
        <FormControl onSubmit={onSubmit} width="95%" margin="0 auto" mt="1%">
            <FormLabel htmlFor="user" className="FormLabel"  mt="1%" mb="1%" >Email</FormLabel>
            <Input type="email"
                name="user"
                id="user"
                onChange={onChange}
                value={formData.user}
                className="Register"
            />
            <FormLabel htmlFor='password' className="FormLabel">Password</FormLabel>
            <Input type="password"
                name="password"
                id="password"
                onChange= {onChange}
                value={formData.password}
                className="Register"
            />
            <Divider />
            <Button type="submit" id="submit" onClick={onSubmit} mt="1%" mb="1%" isDisabled={!canSubmit}>Log In </Button>
        </FormControl> 
        </Box>
        </form>
    )
};

export default LogIn;
