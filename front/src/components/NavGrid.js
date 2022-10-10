import { SessionContext} from '../contexts/SessionContext'
import { DeviceContext } from '../contexts/DeviceContext' 
import {Link as ReachLink} from 'react-router-dom'
import { Grid, GridItem, Text, Link, Button } from '@chakra-ui/react'
import { notification } from './notification';
import LogOut from './LogOut';
import { useState, useEffect, useContext } from "react";


const NavGrid = () => {
    const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
    const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);

    const [gridItems, setGridItems] = useState();
    const [columnCount, setColumnCount] = useState(`repeat(5, 1fr)`);
    const Gridlink = (text) => {
        let titled = text.text.charAt(0).toUpperCase() + text.text.slice(1)
        console.log(titled)
        return (<>
            <GridItem>
                <Link as={ReachLink} to={`/${text.text}`}><Text as='b'>{titled}</Text></Link>
            </GridItem>
        </>)
    }
    const constructGrid = () => {
        let validItems = []
        if(sessionStatus){
            validItems = ["alarms", "logout", "about"]
        } else {
            validItems = ["login", "register", "about"]            
        }
        let validLinks = []
        for (const item of validItems){
            switch(item){
                case "logout":
                    console.log(item);
                    validLinks.push(<GridItem><LogOut/></GridItem>)
                    break;
                default:
                    console.log(item);
                    validLinks.push(<Gridlink text={item}/>);
                    break;
            }
        }
        setGridItems(validLinks);
        setColumnCount( `repeat(${validLinks.length}, 1fr)`)
        console.log(gridItems)
    }
    useEffect(()=>{
        constructGrid()
    },[token, sessionStatus])
    return (
        <Grid  h='80px'
            templateRows='repeat(1, 1fr)'
            templateColumns={columnCount}
            gap={4}
        >
            {gridItems}
        </Grid>
    )
    
};

export default NavGrid