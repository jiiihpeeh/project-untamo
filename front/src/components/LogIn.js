import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import { Input ,
    InputGroup,
    InputRightAddon,
    FormControl,
    FormLabel,
    Button,
    FormErrorMessage,
    FormHelperText,
    Box,
    } from '@chakra-ui/react';
import React, { useContext } from "react";
import { SessionContext } from "../contexts/SessionContext"
    
        
/* const LogInSubmit = (props) => {
    return (
        <Button type="submit" id="submit">Log In </Button>
    )
};
 */
const LogIn = () => {
    const { token, setToken, userInfo, setUserInfo, sessionStatus, setSessionStatus } = useContext(SessionContext);

    const [formData, setFormData] = useState({
        user: "",
        password: ""
    });
    const onChange = (event) => {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name] : event.target.value
            };
        })
    }
    const onSubmit = async (event) => {
        try{
            event.preventDefault();
            let res = await axios.post('/login', formData);
            console.log(res.data)
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", res.data.user)
            localStorage.setItem("screenname", res.data.screenname)
            localStorage.setItem("firstname", res.data.firstname)
            localStorage.setItem("lastname", res.data.lastname)
            let userRes = Object.assign({}, res.data)
            delete userRes.token
            setUserInfo(userRes)
            setToken(res.data.token)
            setSessionStatus(true)
            return navigate('/welcome')
        }catch(err){
            console.error(err)
        }

    }
    const navigate = useNavigate()
    return (
        <Box bg='lightgray' width="30em" margin="0 auto"  borderRadius='lg'>
        <FormControl onSubmit={onSubmit} width="95%" margin="0 auto" >
            <FormLabel htmlFor="user">Email</FormLabel>
            <Input type="email"
                name="user"
                id="user"
                onChange={onChange}
                value={formData.user}
            />
            <FormLabel htmlFor='password'>Password</FormLabel>
            <Input type="password"
                name="password"
                id="password"
                onChange= {onChange}
                value={formData.password}
            />
            <Button type="submit" id="submit" onClick={onSubmit}>Log In </Button>
            {/* <LogInSubmit /> */}
        </FormControl> 
        </Box>
    )
}

export default LogIn;
