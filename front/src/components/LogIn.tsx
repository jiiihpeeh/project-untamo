import React, { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import { Input , FormControl,FormLabel,
        Button, Box,Divider, Spinner } from '@chakra-ui/react'
import { useLogIn, extend,usePopups, useSettings } from "../stores"
import { SessionStatus, Path, ColorMode } from "../type"

import QrScanner from 'qr-scanner'
import '../App.css'

const LogIn = () => {
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const logIn = useLogIn((state) => state.logIn)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state)=>state.windowSize)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navBarHeight = useSettings((state) => state.height)
    const colorMode = useSettings((state) => state.colorMode)

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [ canSubmit, setCanSubmit ] = useState(false)

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name] : event.target.value
            }
        })
    }
    
    const onSubmit =  () => {
        logIn(formData.email, formData.password)
        navigate(extend(Path.Welcome))
    }


    const navigate = useNavigate()

    useEffect(() =>{
        if(sessionStatus == SessionStatus.Valid){
            navigate(extend(Path.Alarms))
        }
    },[sessionStatus ])

    useEffect(()=>{
        const isOK = () => {
            if(formData.password.length > 5 && emailPattern.test(formData.email)){
                setCanSubmit(true)
            }else {
                setCanSubmit(false)
            }
        }
        const emailPattern = new RegExp(".+@.+..+")
        isOK()
    },[formData])

    function showLogIn(){
        switch(sessionStatus){
            case SessionStatus.Validating:
                const radius = Math.min(windowSize.width/2, windowSize.height/2)
                const top =  navBarTop?windowSize.height/2 - radius +navBarHeight:windowSize.height/2 - radius -navBarHeight
                return(<Spinner
                            thickness='8px'
                            speed='0.65s'
                            emptyColor='gray.200'
                            color='blue.500'
                            size='xl'
                            style={{width: radius, height: radius, left: windowSize.width/2-radius/2, top: top, position:"absolute" }}                        
                        /> )
            default:
                return(
                    <form>
                        <Box 
                            className={(colorMode === ColorMode.Light)?'UserForm':"UserFormDark"}
                            width={(isMobile)?windowSize.width*0.90:Math.min(500, windowSize.width*0.90)}
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
                                    onChange={(e) =>onChange(e)}
                                    value={formData.email}
                                    className="Register"
                                />
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
                                    onChange= {(e) =>onChange(e)}
                                    value={formData.password}
                                    className="Register"
                                />
                                <Divider />
                                <Button 
                                    type="submit" 
                                    id="submit" 
                                    onClick={() =>onSubmit()} 
                                    mt="1%" 
                                    mb="1%" 
                                    colorScheme={(colorMode === ColorMode.Dark)?"blue":"gray.500"}
                                    isDisabled={!canSubmit}
                                >
                                    Log In 
                                </Button>
                            </FormControl> 
                        </Box>
                    </form>
                )
            }
    }
    return (<>
                {showLogIn()}
            </>
            )
}

export default LogIn
