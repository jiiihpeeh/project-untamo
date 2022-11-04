import { SessionContext} from '../contexts/SessionContext';
//import { DeviceContext } from '../contexts/DeviceContext';
import {Link as ReachLink} from 'react-router-dom';
import { Grid, GridItem, Text, Link, Flex, Spacer, HStack, Center } from '@chakra-ui/react';
//import { notification } from './notification';
import { useState, useEffect, useContext } from "react";
import UserMenu from './UserMenu';
import About from './About';
import DeviceMenu from './DeviceMenu';
import ServerLocation from './ServerLocation';
import Countdown from "react-countdown";
import { AdminContext } from '../contexts/AdminContext';
import { timePadding } from "./AlarmComponents/timePadding";


const NavGrid = () => {
    //const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
    const {adminToken, setAdminToken, adminTime, setAdminTime} = useContext(AdminContext);
    const { sessionStatus } = useContext(SessionContext);
    const [ validItems, setValidItems ] = useState(["login", "register", "about"]);
    const [ showAdmin, setShowAdmin ] = useState(false);

    const FlexLink = (text) => {
        let titled = text.text.charAt(0).toUpperCase() + text.text.slice(1);
        return (<>
                <Link as={ReachLink} 
                      to={`/${text.text}`} 
                      id={`link-${text.text}`} >
                      <Text as='b'>
                            {titled}
                      </Text>
                </Link>
        </>);
    }
    const timeOutput = ({ minutes, seconds,}) => {
        return `( remaining admin time: ${timePadding(minutes)}:${timePadding(seconds)})`
    }
   
    useEffect(() => {
        const constructGrid = () => {
            if(sessionStatus){
                setValidItems(["alarms", "devices", 'user']);
            } else {
                setValidItems(["login", "register",'server', "about"]);        
            }
        }
        constructGrid();
    },[sessionStatus]);

    
    useEffect(()=> {
        try{
            clearTimeout(JSON.parse(sessionStorage.getItem('adminTimeOut')));
        }catch(err){}
        setShowAdmin(true);
        let tID = setTimeout(() => setShowAdmin(false), adminTime - Date.now());
        sessionStorage.setItem('adminTimeOut', JSON.stringify(tID));
    },[adminTime]);
    useEffect(() => {
        console.log("admin: ", showAdmin)
    },[showAdmin])
    return (
        <Center>   
            <HStack spacing='60px'>
            {validItems.includes('login') && <>
            <Spacer/>
            <FlexLink text='login' key={'navgrid-login'}/></>}
            {validItems.includes('register') && <>
            <Spacer/>
            <FlexLink text='register' key={'navgrid-register'}/></>}
            {validItems.includes('alarms') && <>
            <Spacer/>
            <FlexLink text='alarms' key={'navgrid-alarms'}/></>}
            {validItems.includes('devices') && <>
            <Spacer/>
            <DeviceMenu/></>}
            {validItems.includes('server') && <>
            <Spacer/>
            <ServerLocation/></>}
            {validItems.includes('about') && <>
            <Spacer/>
            <About/></>}
            {showAdmin && <>
            <Spacer/>
            <HStack><FlexLink text='admin' key={'navgrid-admin'}/>
            <Text as='b' color='red' > 
                <Countdown  date={adminTime}
                            renderer={timeOutput}
                            />
            </Text></HStack></>}
            {validItems.includes('user') && <>
            <Spacer/>
            <UserMenu/></>}
            <Spacer/>
            </HStack>
        </Center>
    )
    
};

export default NavGrid;