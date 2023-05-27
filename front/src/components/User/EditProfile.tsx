import { Button,Drawer,DrawerBody, DrawerHeader,Input,Checkbox,
         DrawerOverlay,DrawerContent, Flex, Spacer,AccordionPanel,
         DrawerCloseButton,FormLabel, FormControl, AccordionButton,
         Accordion,AccordionItem,Box } from '@chakra-ui/react'
import React, { useState, useEffect, useRef } from 'react'
import { useLogIn, usePopups } from '../../stores'
import { FormData } from '../../type'
import '../../App.css'
import console from 'console'

// Option for Profile picture? (not necessary)

const emptyForm : FormData= {
    firstName: '',
    lastName:'',
    email: '',
    screenName: '',
    password: '',
    changePassword: '',
    confirmPassword:''
} 

function EditProfile() {
    const setShowEditProfile = usePopups((state) => state.setShowEditProfile)	
    const showEditProfile = usePopups((state) => state.showEditProfile)
    const isMobile = usePopups((state)=> state.isMobile)
    const btnRef = useRef<HTMLButtonElement>(null)
    const editUserInfo = useLogIn((state)=> state.editUser)
    const userInfo = useLogIn((state)=> state.user)
    const [formData, setFormData] = useState<FormData>(emptyForm)
    const [ changePassword, setChangePassword ] = useState(false)
    const [ formChecks, setFormChecks ] = useState(true)
    function getInitForm() {
        return {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            email: userInfo.email,
            screenName: userInfo.screenName,
            password: '',
            changePassword: '',
            confirmPassword: ''
        }
    }
    function onChange(event: React.FormEvent<HTMLDivElement>) {
        if (!event) {
            return
        }
        let eventTarget = event.target as HTMLInputElement
        //console.log(eventTarget.name,eventTarget.value)
        setFormData((formData) => {
            return {
                ...formData,
                [eventTarget.name]: eventTarget.value
            }
        })
    }

    async function onRegister() {
        editUserInfo(formData, changePassword)
        setShowEditProfile(false)
    }

    function onCloseFixed() {
        setChangePassword(false)
        setFormData(emptyForm)
        setShowEditProfile(false)
    }
    function drawerOpen() {
        setFormData(getInitForm())
    }
    useEffect(() => {
        function passwordChecker() {
            if (formData && formData.password && formData.password.length < 6) {
                setFormChecks(false)
                return
            }
            if (changePassword) {
                if (formData.changePassword.length > 5 &&
                    (formData.changePassword === formData.confirmPassword) &&
                    (formData.changePassword !== formData.password)) {
                    setFormChecks(true)
                    return
                } else {
                    setFormChecks(false)
                    return
                }
            } else {
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
        <Drawer
            isOpen={showEditProfile}
            placement='left'
            onClose={onCloseFixed}
            finalFocusRef={btnRef}
            size={(isMobile)?'full':'md'}
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
                >
                    <AccordionItem>
                        <h2>
                        <AccordionButton
                            onClick={() => {setChangePassword(!changePassword)}}
                        >
                            <Box 
                                flex='1' 
                                textAlign='left'
                            >
                                Change Password
                            </Box>
                            <Checkbox 
                                isChecked={changePassword}
                                colorScheme='green'
                                isDisabled={true}
                            />
                        </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <FormLabel 
                                htmlFor="changePassword"
                            >
                                New Password
                            </FormLabel>
                            <Input 
                                name='changePassword'
                                id="edit-newPassword" 
                                onChange={onChange}
                                value={formData.changePassword}
                                type="password" 
                            />

                            <FormLabel 
                                htmlFor="confirmPassword"
                            >
                                Confirm new Password
                            </FormLabel>
                            <Input 
                                name='confirmPassword'
                                id="edit-confirmPassword"
                                onChange={onChange}
                                value={formData.confirmPassword}
                                type="password"
                            />
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </FormControl>
            </form>
            <Flex m={"15%"}>
                <Button 
                    variant='outline' mr={3} 
                    onClick={onCloseFixed} 
                    colorScheme="red"
                >
                    Cancel
                </Button>
                <Spacer/>
                <Button 
                    colorScheme='green' 
                    onClick={() =>onRegister()} 
                    isDisabled={!formChecks}
                >
                    Save
                </Button>
            </Flex>
            </DrawerBody>
        </DrawerContent>
        </Drawer>
     )
}

export default EditProfile