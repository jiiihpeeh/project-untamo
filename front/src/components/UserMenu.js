import React, { useContext, useEffect } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { DeviceContext } from "../contexts/DeviceContext";
import { Avatar,
         Menu,
         MenuButton,
		 MenuList,
		 MenuItem,
		 IconButton,
		 MenuGroup,
		 MenuDivider} from '@chakra-ui/react';
import LogOut from './LogOut';
import About from "./About";


const UserMenu = () => {
	const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);
	const { currentDevice, setCurrentDevice, devices, setDevices } = useContext(DeviceContext);
	

	return (
		<Menu>
		<MenuButton as={IconButton} borderRadius="50%" size='sm'>
			<Avatar name={userInfo.screenname} size='sm'/>
		</MenuButton>
		
		<MenuList>
			<MenuGroup title='Profile'>
				<MenuItem>Edit Profile</MenuItem>
				<MenuDivider />
				<MenuItem><LogOut/></MenuItem>
			</MenuGroup>
			<MenuItem><About/></MenuItem>
		</MenuList>
		</Menu>
	)
}

export default UserMenu;