 import React, {  useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import { useNavigate } from 'react-router-dom'
import { Input, InputGroup,Box,
         InputRightAddon, FormControl,
         FormLabel, Text, Button } from '@chakra-ui/react'
import { useServer, extend, usePopups } from '../../stores'
import useRegister from './RegisterBackend'
import { CheckCircleIcon, NotAllowedIcon, WarningTwoIcon  } from '@chakra-ui/icons';
import '../../App.css'

enum Query{
    ZXCVBN = "zxcvbn",
    Form = "form" 
}

const Register = () => {
    const registered = useRegister((state)=>state.registered)
    const register = useRegister((state)=> state.register)
    const firstName = useRegister((state)=> state.firstName)
    const setFirstName = useRegister((state)=> state.setFirstName)
    const lastName = useRegister((state)=> state.lastName)
    const setLastName = useRegister((state)=> state.setLastName)
    const email = useRegister((state)=> state.email)
    const setEmail = useRegister((state)=> state.setEmail)
    const password = useRegister((state)=> state.password)
    const setPassword = useRegister((state)=> state.setPassword)
    const setScore = useRegister((state)=> state.setScore)
    const setServerMinimum = useRegister((state)=> state.setServerMinimum)
    const setPasswordCheck = useRegister((state)=> state.setPasswordCheck)
    const passwordCheck = useRegister((state)=> state.passwordCheck)
    const formCheck = useRegister((state)=> state.formCheck)
    const confirmPassword = useRegister((state)=> state.confirmPassword)
    const setConfirmPassword = useRegister((state)=> state.setConfirmPassword)
    const clearForm = useRegister((state)=> state.clear)
    const getFormData = useRegister((state)=>state.formData)
    const setFormTimeout = useRegister((state)=>state.setFormTimeOut)
    const clearFormTimeout = useRegister((state)=>state.clearFormTimeout)
    const setPasswordTimeout = useRegister((state)=>state.setFormTimeOut)
    const clearPasswordTimeout = useRegister((state)=>state.clearFormTimeout)
    const setFormCheck = useRegister((state)=>state.setFormCheck)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state)=>state.windowSize)

    const wsServer = useServer((state) => state.wsAddress)
    const wsURL = wsServer+'/register-check'
    const navigate = useNavigate()

    const { sendMessage, lastMessage } = useWebSocket(wsURL)
    
    
    const PasswordMatch = () => {
        let checkmark = (password.length >5 && password === confirmPassword) ? <CheckCircleIcon/>: <NotAllowedIcon/>;
        return (<Text>{checkmark}</Text>)
    }
    const PasswordCheck = () => {
        let checkmark = (password.length >5 && passwordCheck) ? <CheckCircleIcon/>: <WarningTwoIcon/>;
        return (<Text>{checkmark}</Text>)
    }

    useEffect(()=>{
        if(registered){
            clearForm()
            navigate(extend("/login"))
        }
    },[registered])

    useEffect(()=>{
        clearFormTimeout()
        let query = setTimeout(() =>{ 
                                        if(password.length> 4 && email.length > 3){
                                            sendMessage(JSON.stringify({...getFormData(), query: Query.Form}))
                                        }
                                    },200)
        setFormTimeout(query)
    },[firstName, lastName, email])

    useEffect(()=>{
        clearPasswordTimeout()
        let query = setTimeout(() =>{   
                                        if(password.length > 4){
                                            sendMessage(JSON.stringify({password: password, query: Query.ZXCVBN}))
                                            sendMessage(JSON.stringify({...getFormData(), query: Query.Form}))
                                        }
                                    },200)
        setPasswordTimeout(query)
    },[password])

    useEffect(()=>{
        if(lastMessage){
            let msg = JSON.parse(lastMessage.data)
            if(!msg){
                return
            }
            //console.log(msg)
            switch(msg.type){
                case Query.ZXCVBN:
                    if(msg.content){
                        interface Content{
                            guesses: number,
                            score: number,
                            server_minimum: number
                        }
                        let content : Content = msg.content
                        let passwordCheck = content.guesses > content.server_minimum
                        setPasswordCheck(passwordCheck)
                        setScore(content.score)
                        setServerMinimum(content.server_minimum)
                    }
                    break
                case Query.Form:
                    if(msg.content){
                        let content = msg.content as boolean
                        setFormCheck(content)
                    }
                    break
                default:
                    break
            }
        }
    },[lastMessage])
    // useEffect(()=>{
    //     console.log(passwordCheck, formCheck)
    // },[passwordCheck, formCheck])
    return (
        <Box 
            bg='lightgray' 
            className='UserForm' 
            width={(isMobile)?windowSize.width*0.90:Math.min(500, windowSize.width*0.90)}
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
                <Input type="text"
                    name="firstName"
                    id="firstName"
                    onChange={(e)=>setFirstName(e.target.value)}
                    value={firstName}
                    className='Register'
                />
                <FormLabel 
                    htmlFor="lastName"
                >
                    Last name (Optional)
                </FormLabel>
                <Input type="text"
                    bgColor="GhostWhite"
                    name="lastName"
                    id="lastName"
                    onChange={(e)=>setLastName(e.target.value)}
                    value={lastName}
                    className='Register'
                />
                <FormLabel 
                    htmlFor="email"
                >
                    Email (Required)
                </FormLabel>
                <Input type="email"
                    name="email"
                    id="email"
                    onChange={(e)=>setEmail(e.target.value)}
                    value={email}
                    className='Register'
                />
                <FormLabel 
                    htmlFor='password'
                >
                    Password
                </FormLabel>
                <InputGroup>
                    <Input type="password"
                        name="password"
                        id="password"
                        onChange= {(e) => setPassword(e.target.value)}
                        value={password}
                        className='Register'
                    />
                    <InputRightAddon 
                        children={<PasswordCheck/>}
                    />
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
                        onChange= {(e)=> setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        className='Register'
                    />
                    <InputRightAddon 
                        children={<PasswordMatch/>}
                    />
                </InputGroup>
                <Button
                    m="5px"
                    onClick={()=>register()}
                    isDisabled={!(passwordCheck && formCheck && password === confirmPassword && password.length > 5)}
                >
                    Register
                </Button>
            </FormControl> 
        </Box>
    )
}

export default Register;
