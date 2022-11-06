import React, { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext"
import { Avatar,Menu,
         MenuButton,MenuList,
		 MenuItem,IconButton,
		 MenuGroup,MenuDivider} from '@chakra-ui/react';
import LogOut from './LogOut';
import About from "./About";
import EditProfile from "./EditProfile";
import AdminLogin from "./AdminLogIn";


const UserMenu = () => {
	const { userInfo } = useContext(SessionContext);
	

	return (
		<Menu>
			<MenuButton as={IconButton} borderRadius="50%" size='sm'>
				<Avatar name={userInfo.screenname} size='sm'/>
			</MenuButton>
		
			<MenuList>
				<MenuGroup title='Profile'>
					<MenuItem>
						<EditProfile/>
					</MenuItem>
					{userInfo.admin && <><MenuDivider/>
					<MenuItem closeOnSelect={false}>
						<AdminLogin/>
					</MenuItem></>}
					<MenuDivider />
					<MenuItem>
						<LogOut/>
					</MenuItem>
				</MenuGroup>
					<MenuItem>
						<About/>
					</MenuItem>
			</MenuList>
		</Menu>
	)
}

export default UserMenu;