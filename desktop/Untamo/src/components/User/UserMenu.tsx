import React, { useEffect} from "react"
import { Text, Modal, Button,ModalOverlay, ModalContent,
         ModalHeader,ModalBody,  ModalCloseButton } from '@chakra-ui/react'
import { useLogIn, usePopups } from "../../stores"
import { SessionStatus } from "../../type"
import { refreshToken } from "../../stores/loginStore"

function UserMenu() {
    const userInfo = useLogIn((state) => state.user)
    const setShowLogOut = usePopups((state) => state.setShowLogOut)
    const setShowAbout = usePopups((state) => state.setShowAbout)
    const setShowEditProfile = usePopups((state) => state.setShowEditProfile)
    const setShowAdminLogIn = usePopups((state) => state.setShowAdminLogIn)
    const showUserMenu = usePopups((state) => state.showUserMenu)
    const setShowUserMenu = usePopups((state) => state.setShowUserMenu)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const [ isSessionValid, setIsSessionValid ] = React.useState(sessionStatus === SessionStatus.Valid)
    
    useEffect(() => {
        if ( sessionStatus === SessionStatus.Valid){
            setIsSessionValid(true)
        }else{
            setIsSessionValid(false)
        }
    }, [sessionStatus])
    
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
                <ModalCloseButton />
                <ModalBody>
                    <Button
                        onClick={() => {
                            setShowEditProfile(true)
                            setShowUserMenu(!showUserMenu)
                        } }
                        w={"100%"}
                        m={"2%"}
                        isDisabled={!isSessionValid}
                    >
                        <Text as='b'>
                            Edit Profile
                        </Text>
                    </Button>
                    {userInfo.admin && <>
                        <Button
                            mr={5}
                            onClick={() => {
                                setShowAdminLogIn(true)
                                setShowUserMenu(!showUserMenu)
                            } }
                            w={"100%"}
                            m={"2%"}
                            bg={"red"}
                            isDisabled={!isSessionValid}
                        >
                            Admin Log In
                        </Button></>}
                    <Button
                        onClick={() => {
                            setShowLogOut(true)
                            setShowUserMenu(!showUserMenu)
                        } }
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
                        onClick={() => {
                            refreshToken(false)
                            console.log("refreshing session credentials")
                            setShowUserMenu(!showUserMenu)  
                        }}
                        w={"100%"}
                        m={"2%"}
                    >
                        Refresh Session Credentials
                    </Button>
                    <Button
                        onClick={() => {
                            setShowAbout(true)
                            setShowUserMenu(!showUserMenu)
                        } }
                        w={"100%"}
                        m={"2%"}
                    >
                        <Text as='b'>
                            About Untamo
                        </Text>
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default UserMenu