import { SessionContext} from '../contexts/SessionContext';
//import { DeviceContext } from '../contexts/DeviceContext';
import {Link as ReachLink} from 'react-router-dom';
import { Grid, GridItem, Text, Link } from '@chakra-ui/react';
//import { notification } from './notification';
import { useState, useEffect, useContext } from "react";
import UserMenu from './UserMenu';
import About from './About';
import DeviceMenu from './DeviceMenu';
import ServerLocation from './ServerLocation';

const NavGrid = () => {
    //const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
    const { sessionStatus } = useContext(SessionContext);
    const [ validItems, setValidItems ] = useState(["login", "register", "about"]);

    const GridLink = (text) => {
        let titled = text.text.charAt(0).toUpperCase() + text.text.slice(1);
        return (<>
            <GridItem key={`navgridlink-${text.text}`} >
                <Link as={ReachLink} to={`/${text.text}`} id={`link-${text.text}`} ><Text as='b'>{titled}</Text></Link>
            </GridItem>
        </>);
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

    return (
        <Grid  h='4%'mt='0.5%'
            templateRows='repeat(1, 1fr)'
            templateColumns={`repeat(${validItems.length}, 1fr)`}
            gap={4}
            key="navgrid-assembled"
        >   
            {validItems.includes('login') && 
            <GridLink text='login' key={'navgrid-login'}/>}
            {validItems.includes('register') && 
            <GridLink text='register' key={'navgrid-register'}/>}
            {validItems.includes('alarms') && 
            <GridLink text='alarms' key={'navgrid-alarms'}/>}
            {validItems.includes('devices') && 
            <GridItem key="navgrid-device"><DeviceMenu/></GridItem>}
            {validItems.includes('server') &&
            <GridItem key="navgrid-server"><ServerLocation/></GridItem>}
            {validItems.includes('about') && 
            <GridItem key="navgrid-about"><About/></GridItem>}
            {validItems.includes('user') && 
            <GridItem key="navgrid-user"><UserMenu/></GridItem>}
        </Grid>
    )
    
};

export default NavGrid;