import React, {  useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, InputGroup,Box, VisuallyHidden,
         InputRightAddon, FormControl,
         FormLabel, Text, Button } from '@chakra-ui/react'
import { useServer, extend, usePopups, useSettings } from '../../stores'
import useRegister from './RegisterBackend'
import { CheckCircleIcon, NotAllowedIcon, WarningTwoIcon  } from '@chakra-ui/icons'
import { Path, ColorMode } from '../../type'
import '../../App.css'

function Register() {
    const registered = useRegister((state) => state.registered)
    const register = useRegister((state) => state.register)
    const firstName = useRegister((state) => state.firstName)
    const setFirstName = useRegister((state) => state.setFirstName)
    const lastName = useRegister((state) => state.lastName)
    const setLastName = useRegister((state) => state.setLastName)
    const email = useRegister((state) => state.email)
    const setEmail = useRegister((state) => state.setEmail)
    const password = useRegister((state) => state.password)
    const setPassword = useRegister((state) => state.setPassword)
    const formCheck = useRegister((state) => state.formCheck)
    const confirmPassword = useRegister((state) => state.confirmPassword)
    const setConfirmPassword = useRegister((state) => state.setConfirmPassword)
    const clearForm = useRegister((state) => state.clear)
    const getFormData = useRegister((state) => state.formData)
    const setFormTimeout = useRegister((state) => state.setFormTimeOut)
    const clearFormTimeout = useRegister((state) => state.clearFormTimeout)
    const setFormCheck = useRegister((state) => state.setFormCheck)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state) => state.windowSize)
    const colorMode = useSettings((state) => state.colorMode)
    const wsRegisterMessage = useServer((state) => state.wsRegisterMessage)
    const wsDisconnect = useServer((state) => state.wsRegisterDisconnect)
    const sendMessage = useServer((state) => state.wsRegisterSendMessage)
    const question = useRegister((state) => state.question)
    const setQuestion = useRegister((state) => state.setQuestion)
    const navigate = useNavigate()

    function PasswordMatch() {
        let checkmark = (password.length > 5 && password === confirmPassword) ? <CheckCircleIcon /> : <NotAllowedIcon />
        return (
            <Text>
                {checkmark}
            </Text>
        )
    }
    function PasswordCheck() {
        let checkmark = (password.length > 5 && formCheck) ? <CheckCircleIcon /> : <WarningTwoIcon />
        return (
            <Text>
                {checkmark}
            </Text>
        )
    }

    useEffect(() => {
        if (registered) {
            clearForm()
            navigate(extend(Path.LogIn))
            wsDisconnect()
        }
    }, [registered])

    useEffect(() => {
        clearFormTimeout()
        let query = setTimeout(() => {
            if (password.length > 4 && email.length > 3) {
                sendMessage(JSON.stringify({ ...getFormData() }))
            }
        }, 200)
        setFormTimeout(query)
    }, [firstName, lastName, email, password])



    useEffect(() => {
        console.log("wsRegisterMessage", wsRegisterMessage)
        if (!wsRegisterMessage) {
            return
        }
        setFormCheck(wsRegisterMessage.formPass)

    }, [wsRegisterMessage])

    return (
        <Box
            //bg='lightgray' 
            width={(isMobile) ? windowSize.width * 0.90 : Math.min(500, windowSize.width * 0.90)}
            mt={"30%"}
            className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
        >
            <FormControl
                width="95%"
                margin="0 auto"
            >
                <FormLabel
                    htmlFor="firstName"
                >
                    First name (Optional)
                </FormLabel>
                <Input
                    type="text"
                    name="firstName"
                    id="firstName"
                    onChange={(e) => setFirstName(e.target.value)}
                    value={firstName}
                    bgColor="GhostWhite" />
                <FormLabel
                    htmlFor="lastName"
                >
                    Last name (Optional)
                </FormLabel>
                <Input
                    type="text"
                    name="lastName"
                    id="lastName"
                    onChange={(e) => setLastName(e.target.value)}
                    value={lastName}
                    bgColor="GhostWhite" />
                <FormLabel
                    htmlFor="email"
                >
                    Email (Required)
                </FormLabel>
                <Input
                    type="email"
                    name="email"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    bgColor="GhostWhite" />
                <FormLabel
                    htmlFor='password'
                >
                    Password
                </FormLabel>
                <InputGroup>
                    <Input
                        type="password"
                        name="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        bgColor="GhostWhite" />
                    <InputRightAddon
                        children={<PasswordCheck />} />
                </InputGroup>

                <FormLabel
                    htmlFor='confirm_password'
                >
                    Confirm Password
                </FormLabel>
                <InputGroup>
                    <Input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        bgColor="GhostWhite" />
                    <InputRightAddon
                        children={<PasswordMatch />} />
                </InputGroup>
                <VisuallyHidden>
                    <FormLabel
                        htmlFor='question'
                    >
                        What is 2+7?
                    </FormLabel>
                    <Input
                        type="text"
                        name="question"
                        id="question"
                        onChange={(e) => setQuestion(e.target.value)}
                        value={question}
                        bgColor="GhostWhite"
                    />

                </VisuallyHidden>
                <Button
                    m="5px"
                    onClick={() => register()}
                    //colorScheme={(colorMode === ColorMode.Dark)?"blue":"blueGray"}
                    color={(colorMode === ColorMode.Dark) ? "blue" : "black"}
                    isDisabled={!( formCheck && password === confirmPassword )}
                >
                    Register
                </Button>
            </FormControl>
        </Box>
    )
}

export default Register
