import React from "react"
import { Menu, Text, Box,
         MenuButton,MenuList,
		 MenuItem,MenuGroup,
		 MenuDivider} from '@chakra-ui/react'
import { useLogIn, usePopups } from "../../stores"
import { MenuType } from "../../stores/popUpStore"

const UserMenu = () => {
	const userInfo = useLogIn((state)=>state.user)
	const setShowLogOut = usePopups((state)=> state.setShowLogOut)
	const setShowAbout = usePopups((state)=> state.setShowAbout)
	const setShowEditProfile = usePopups((state) => state.setShowEditProfile)	
	const setShowAdminLogIn = usePopups((state) => state.setShowAdminLogIn)
	const showUserMenu = usePopups((state)=> state.showUserMenu)
	const setShowUserMenu = usePopups((state)=> state.setShowUserMenu)
	const closeMenu = () => {
		setShowUserMenu(false, "userMenu", MenuType.Menu)
	}

	return (
		<Menu
			isOpen={showUserMenu.show}
			id="userMenu"
		>
			<MenuButton
				as={Box}
				style={showUserMenu.style}
				size="sm"
			>
			</MenuButton>
			<MenuList
				onClick={()=>closeMenu()}
				onMouseLeave={() =>{addEventListener("click", closeMenu,{once:true})}}
			>
				<MenuGroup title='Profile'
				>
					<MenuItem>
					<Text 
						onClick={()=>{setShowEditProfile(true)}}
						w={"100%"}
					>	
						<Text as='b'>
							Edit Profile
						</Text>
					</Text>
					</MenuItem>
					{userInfo.admin && <><MenuDivider/>
					<MenuItem closeOnSelect={false}>
						<Text 
							mr={5} 
							onClick={()=>{setShowAdminLogIn(true)}}
							w={"100%"}
						>
							Admin LogIn
						</Text>
					</MenuItem></>}
					<MenuDivider />
					<MenuItem>
						<Text	
							onClick={()=>setShowLogOut(true)} 
							id="logout-button" 
							w={"100%"}
						>
							<Text as='b'>
								Log Out
							</Text>
						</Text>
					</MenuItem>
				</MenuGroup>
					<MenuItem>
						<Text 
							onClick={()=>{setShowAbout(true)}}
							w={"100%"}
						>
							<Text as='b'>
								About
							</Text>
						</Text>
					</MenuItem>
			</MenuList>
		</Menu>
	)
}

export default UserMenu