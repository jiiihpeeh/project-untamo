import React, { useEffect, useState } from "react"
import { Input , FormControl,FormLabel, Center, HStack, Spacer,
        Button, Box,Divider, Spinner, VStack } from '@chakra-ui/react'
import { useLogIn, usePopups, useSettings } from "../stores"
import { SessionStatus, Path, ColorMode } from "../type"

import QrScanner from 'qr-scanner'
import '../App.css'

function LogIn() {
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const logIn = useLogIn((state) => state.logIn)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state) => state.windowSize)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navBarHeight = useSettings((state) => state.height)
    const colorMode = useSettings((state) => state.colorMode)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)
    const setShowPasswordForgot = usePopups((state) => state.setShowPasswordForgot)
    const setShowResendActivation = usePopups((state) => state.setShowResendActivation)
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [canSubmit, setCanSubmit] = useState(false)

    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name]: event.target.value
            }
        })
    }

    function onSubmit() {
        logIn(formData.email, formData.password)
        setNavigateTo(Path.Welcome)
    }


    useEffect(() => {
        if (sessionStatus == SessionStatus.Valid) {
            setNavigateTo(Path.Alarms)
        }else if (sessionStatus == SessionStatus.Activate) {
            setNavigateTo(Path.Activate)
        }
    }, [sessionStatus])

    useEffect(() => {
        function isOK() {
            if (formData.password.length > 5 && emailPattern.test(formData.email)) {
                setCanSubmit(true)
            } else {
                setCanSubmit(false)
            }
        }
        const emailPattern = new RegExp(".+@.+..+")
        isOK()
    }, [formData])

    function showLogIn() {
        switch (sessionStatus) {
            case SessionStatus.Validating:
                const radius = Math.min(windowSize.width / 2, windowSize.height / 2)
                const top = navBarTop ? windowSize.height / 2 - radius + navBarHeight : windowSize.height / 2 - radius - navBarHeight
                return (<Spinner
                    thickness='8px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl'
                    style={{ width: radius, height: radius, left: windowSize.width / 2 - radius / 2, top: top, position: "absolute" }} />)
            case SessionStatus.Activate:
                setNavigateTo(Path.Activate)
                break
            default:
                return (
                    <Box>
                        <form>
                            <Box
                                className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
                                width={(isMobile) ? windowSize.width * 0.90 : Math.min(500, windowSize.width * 0.90)}
                                mt="35%"
                            >
                                <FormControl
                                    onSubmit={onSubmit}
                                    width="95%"
                                    margin="0 auto"
                                    mt="15%"
                                >
                                    <FormLabel
                                        htmlFor="email"
                                        className="FormLabel"
                                        mt="1%"
                                        mb="1%"
                                    >
                                        Email
                                    </FormLabel>
                                    <Input
                                        type="email"
                                        name="email"
                                        id="email"
                                        onChange={(e) => onChange(e)}
                                        value={formData.email}
                                        bgColor="GhostWhite"
                                        className="Register" />
                                    <FormLabel
                                        htmlFor='password'
                                        className="FormLabel"
                                    >
                                        Password
                                    </FormLabel>
                                    <Input
                                        type="password"
                                        name="password"
                                        id="password"
                                        onChange={(e) => onChange(e)}
                                        value={formData.password}
                                        bgColor="GhostWhite"
                                        className="Register" />
                                    <Divider />
                                    <Button
                                        type="submit"
                                        id="submit"
                                        onClick={() => onSubmit()}
                                        mt="1%"
                                        mb="1%"
                                        colorScheme={(colorMode === ColorMode.Dark) ? "blue" : "gray"}
                                        isDisabled={!canSubmit}
                                    >
                                        Log In
                                    </Button>
                                </FormControl>
                            </Box>
                        </form>
                        <Center>
                            <VStack>
                            <HStack
                                mt="50px"
                            >
                            
                                <Button
                                    size="xs"
                                    colorScheme={(colorMode === ColorMode.Dark) ? "blue" : "gray"}
                                    onClick={() => setShowPasswordForgot(true)}
                                >
                                    Forgot Password?
                                </Button>
                                <Spacer/>
                                <Button
                                    ml="10px"
                                    size="xs"
                                    colorScheme={"orange"}
                                    onClick={() => setNavigateTo(Path.ResetPassword)}
                                >
                                    Reset Password
                                </Button>
                            </HStack>
                            <Button
                                size="xs"
                                colorScheme= "green"
                                onClick={() => setShowResendActivation(true)}
                            >
                                Didn't receive an activation email?
                            </Button>
                            </VStack>
                        </Center>
                </Box>
            )
        }
    }
    return (<>
        {showLogIn()}
    </>
    )
}

export default LogIn
