import React from "react"
import { Text, Checkbox, IconButton,Modal, Button,ModalOverlay,ModalContent,ModalHeader,ModalBody, Th, Thead,ModalCloseButton, useDisclosure, VStack,  Radio,
	Tooltip, Table, Tr, Td, Tbody, Center } from '@chakra-ui/react'
import { Menu,  Box,
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
		setShowUserMenu(false)
	}

	return (
		<Modal 
			isOpen={showUserMenu} 
			onClose={() => setShowUserMenu(!showUserMenu)}
			isCentered
		>
        <ModalOverlay />
		<ModalContent>

                    <ModalHeader>
                        User Actions
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
			
	
					<Button 
						onClick={()=>{setShowEditProfile(true);setShowUserMenu(!showUserMenu)}}
						w={"100%"}
						m={"2%"}
					>	
						<Text as='b'>
							Edit Profile
						</Text>
					</Button>
					{userInfo.admin && <>
						<Button 
							mr={5} 
							onClick={()=>{setShowAdminLogIn(true); setShowUserMenu(!showUserMenu)}}
							w={"100%"}
							m={"2%"}
							bg={"red"}
						>
							Admin LogIn
						</Button></>}
					<Button	
						onClick={()=>{setShowLogOut(true);setShowUserMenu(!showUserMenu)}} 
						id="logout-button" 
						w={"100%"}
						color="red"
						m={"2%"}
					>
						<Text as='b'>
							Log Out
						</Text>
					</Button>
					<Button 
						onClick={()=>{setShowAbout(true);setShowUserMenu(!showUserMenu)}}
						w={"100%"}
						m={"2%"}
					>
							<Text as='b'>
								About
							</Text>
					</Button> 
			</ModalBody>
			</ModalContent>
		</Modal>
	)
}

export default UserMenu


				{/* {userInfo.admin && <>
						<Text 
							mr={5} 
							onClick={()=>{setShowAdminLogIn(true)}}
							w={"100%"}
						>
							Admin LogIn
						</Text>
						<Text	
							onClick={()=>setShowLogOut(true)} 
							id="logout-button" 
							w={"100%"}
						>
							<Text as='b'>
								Log Out
							</Text>
						</Text>
						<Text 
							onClick={()=>{setShowAbout(true)}}
							w={"100%"}
						>
							<Text as='b'>
								About
							</Text>
						</Text> */}