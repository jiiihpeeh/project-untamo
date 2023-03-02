import {
	Button,Drawer,DrawerBody,
	DrawerFooter,DrawerHeader,
	DrawerOverlay,DrawerContent,
	DrawerCloseButton,FormLabel,
	FormControl, Input,Checkbox,
	Accordion,AccordionItem,Box,
	AccordionButton,AccordionPanel,
	} from '@chakra-ui/react'
import React, { useState, useEffect, useRef } from 'react'
import { useLogIn, usePopups } from '../../stores'
import { FormData } from '../../type'
import '../../App.css'

// Option for Profile picture? (not necessary)

const emptyForm : FormData= {
	firstName: '',
	lastName:'',
	email: '',
	screenName: '',
	password: '',
	change_password: '',
	confirm_password:''
} 

function EditProfile() {
	const setShowEditProfile = usePopups((state) => state.setShowEditProfile)	
	const showEditProfile = usePopups((state) => state.showEditProfile)

	const btnRef = useRef<HTMLButtonElement>(null)
	const editUserInfo = useLogIn((state)=> state.editUser)
	const userInfo = useLogIn((state)=> state.user)
    const [formData, setFormData] = useState<FormData>(emptyForm)
	const [ changePassword, setChangePassword ] = useState(false)
	const [ formChecks, setFormChecks ] = useState(true)
	const getInitForm = () =>{
		return {
			firstName: userInfo.firstName,
			lastName:userInfo.lastName,
			email: userInfo.email,
			screenName: userInfo.screenName,
			password: '',
			change_password: '',
			confirm_password:''
		} 
	}
	const onChange = (event:React.FormEvent<HTMLDivElement>) => {
		if(!event){
			return
		}
		let eventTarget = event.target as HTMLInputElement
		//console.log(eventTarget.name,eventTarget.value)
		setFormData((formData) => {
			return {
				...formData,
				[eventTarget.name] : eventTarget.value
			}
		})
	}

	const onRegister = async () => {
		editUserInfo(formData, changePassword)
	}

	const onCloseFixed = () => {
		  setChangePassword(false)
		  setFormData(emptyForm)
		  setShowEditProfile(false)
	}
	const drawerOpen = () => {
		setFormData(getInitForm())
	}
	useEffect(() => {
		const passwordChecker = () => {
			if(formData && formData.password && formData.password.length < 6){
				setFormChecks(false)
				return
			}
			if(changePassword){
				if (formData.change_password.length > 5 && 
					(formData.change_password === formData.confirm_password) && 
					(formData.change_password !== formData.password)){
					setFormChecks(true)
					return
				}else{
					setFormChecks(false)
					return
				}
			}else{
				setFormChecks(true)
				return
			}
		}
		passwordChecker()
	},[formData,changePassword])

	useEffect(()=>{
		if(showEditProfile){
			drawerOpen()
		}
	},[showEditProfile])
	return (
		<>
		<Drawer
			isOpen={showEditProfile}
			placement='right'
			onClose={onCloseFixed}
			finalFocusRef={btnRef}
		>
		<DrawerOverlay />
		<DrawerContent>
			<DrawerCloseButton />
			<DrawerHeader>
				Edit profile
			</DrawerHeader>
			<DrawerBody>
			<form 
				id='edit-profile-form'
				onSubmit={() =>onRegister()}
            >
			<FormControl>
				<FormLabel 
					htmlFor="screenName"
				>
					Profile name
				</FormLabel>
				<Input 
					name='screenName' 
					id ='edit-screenName' 
					onChange={onChange}
					placeholder={formData.screenName}
					value={formData.screenName} 
				/>

				<FormLabel 
					htmlFor="firstName"
				>
					First Name
				</FormLabel>
				<Input 
					name='firstName'
					id ='edit-firstName' 
					onChange={onChange} 
					value={formData.firstName} 
				/>
			
				<FormLabel 
					htmlFor="lastName"
				>
					Last Name
				</FormLabel>
				<Input 
					name='lastName'
					id ='edit-lastName'
					onChange={onChange} 
					value={formData.lastName}
				/>

				<FormLabel 
					htmlFor="user"
				>
					E-mail
				</FormLabel>
				<Input 
					name='user'
					id ='edit-user' 
					onChange={onChange} 
					value={formData.email}
					type="email" 
				/>

				<FormLabel 
					htmlFor="current_password"
				>
					Current Password
				</FormLabel>
				<Input 
					name='password' 
					onChange={onChange}
					id ='edit-currentPassword'
					value={formData.password}
					type="password" 
				/>
				<Accordion 
					allowToggle={true} 
					onChange={() => {setChangePassword(!changePassword)}}
				>
					<AccordionItem>
						<h2>
						<AccordionButton>
							<Box 
								flex='1' 
								textAlign='left'
							>
								Change Password
							</Box>
							<Checkbox 
								isChecked={changePassword}  
								colorScheme='green'
							/>
						</AccordionButton>
						</h2>
						<AccordionPanel pb={4}>
							<FormLabel 
								htmlFor="change_password"
							>
								New Password
							</FormLabel>
							<Input 
								name='change_password'
								id="edit-newPassword" 
								onChange={onChange}
								value={formData.change_password}
								type="password" 
							/>

							<FormLabel 
								htmlFor="confirm_password"
							>
								Confirm new Password
							</FormLabel>
							<Input 
								name='confirm_password'
								id="edit-confirmPassword"
								onChange={onChange}
								value={formData.confirm_password}
								type="password"
							/>
						</AccordionPanel>
					</AccordionItem>
				</Accordion>
			
			</FormControl>
			</form>

			</DrawerBody>
			<DrawerFooter>
				<Button 
					variant='outline' mr={3} 
					onClick={onCloseFixed} 
					colorScheme="red"
				>
					Cancel
				</Button>
				<Button 
					colorScheme='green' 
					onClick={() =>onRegister()} 
					isDisabled={!formChecks}
				>
					Save
				</Button>
			</DrawerFooter>
		</DrawerContent>
		</Drawer>
	</>
	)
}

export default EditProfile