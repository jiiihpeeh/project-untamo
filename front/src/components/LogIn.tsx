import React, { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import { Input , FormControl,FormLabel,
        Button, Box,Divider, Heading} from '@chakra-ui/react'
import { useLogIn, extend,usePopups } from "../stores"
import { SessionStatus } from "../type"
import QrScanner from 'qr-scanner'
import '../App.css'

const LogIn = () => {
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const logIn = useLogIn((state) => state.logIn)
    const isMobile = usePopups((state) => state.isMobile)
    const windowSize = usePopups((state)=>state.windowSize)

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
        navigate(extend('/welcome'))
    }


    const navigate = useNavigate()

    useEffect(() =>{
        if(sessionStatus == SessionStatus.Valid){
            navigate(extend('/alarms'))
        }
    },[sessionStatus, navigate])

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
    return (
        <form>
            <Box 
                className='UserForm'
                width={(isMobile)?windowSize.width*0.90:Math.min(500, windowSize.width*0.90)}
            >
                <FormControl 
                    onSubmit={onSubmit} 
                    width="95%" 
                    margin="0 auto" 
                    mt="5%"
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
                        isDisabled={!canSubmit}
                    >
                        Log In 
                    </Button>
                </FormControl> 
            </Box>
        </form>
    )
}

export default LogIn
