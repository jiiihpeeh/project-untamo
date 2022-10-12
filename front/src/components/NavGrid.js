import { SessionContext} from '../contexts/SessionContext';
import { DeviceContext } from '../contexts/DeviceContext';
import {Link as ReachLink} from 'react-router-dom';
import { Grid, GridItem, Text, Link, Button } from '@chakra-ui/react';
import { notification } from './notification';
import { useState, useEffect, useContext } from "react";
import UserMenu from './UserMenu';
import About from './About';
import DeviceMenu from './DeviceMenu';

const NavGrid = () => {
    const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
    const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);

    const [gridItems, setGridItems] = useState();
    const [columnCount, setColumnCount] = useState(`repeat(5, 1fr)`);
    const GridLink = (text) => {
        let titled = text.text.charAt(0).toUpperCase() + text.text.slice(1);
        return (<>
            <GridItem key={`navgridlink-${text.text}`} >
                <Link as={ReachLink} to={`/${text.text}`} id={`link-${text.text}`} ><Text as='b'>{titled}</Text></Link>
            </GridItem>
        </>);
    }
    const constructGrid = () => {
        let validItems = [];
        if(sessionStatus){
            validItems = ["alarms", "devices", 'user'];
        } else {
            validItems = ["login", "register", "about"];        
        }
        let validLinks = [];
        for (const item of validItems){
            switch(item){
                case 'user':
                    validLinks.push(<GridItem key="navgrid-user"><UserMenu/></GridItem>);
                    break;
                case 'about':
                    validLinks.push(<GridItem key="navgrid-about"><About/></GridItem>);
                    break;
                case 'devices':
                    validLinks.push(<GridItem key="navgrid-device"><DeviceMenu/></GridItem>);
                    break;
                default:
                    validLinks.push(<GridLink text={item} key={item}/>);
                    break;
            }
        }
        setGridItems(validLinks);
        setColumnCount( `repeat(${validLinks.length}, 1fr)`);
    }
    useEffect(()=>{
        constructGrid();
    },[token, sessionStatus]);
    return (
        <Grid  h='80px'
            templateRows='repeat(1, 1fr)'
            templateColumns={columnCount}
            gap={4}
            key="navgrid-assembled"
        >
            {gridItems}
        </Grid>
    )
    
};

export default NavGrid