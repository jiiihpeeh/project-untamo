 
import { useState, useEffect, useContext } from 'react'
//import './registerComponents/registerCheck.css'
import useWebSocket from 'react-use-websocket';
import { formString } from './registerComponents/formString';
import RegisterPasswordCheck from './registerComponents/RegisterPasswordCheck';

import RegisterSubmit from './registerComponents/RegisterSubmit';
import PasswordMatch from './registerComponents/PasswordMatch';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { notification } from './notification';
import '../App.css'
import { Input ,
    InputGroup,
    InputRightAddon,
    FormControl,
    FormLabel,
    Box,
    } from '@chakra-ui/react'
import { SessionContext } from '../contexts/SessionContext';
import { websocketAddress } from './websocketAddress';

const Register = (props) => {
    const {  sessionStatus, server } = useContext(SessionContext);
    const wsURL = websocketAddress(server)+'/registercheck'
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        password_confirm: ""
    });

    const [passwordCheck, setPasswordCheck] = useState(new Map());
    const [formCheck, setFormCheck] = useState(new Map());
    const [values, setValues] = useState({
        passwords: {},
        forms: {},
        current: {}
    });
    //checkmark = (form.password.length >5 && form.password === form.password_confirm) ? "✓": "𐄂";
    const { sendMessage, lastMessage } = useWebSocket(wsURL);
    

    useEffect(() => {
        if(!formCheck.has(formString(formData))){
            let formmsg_part = Object.assign({},formData);
            delete formmsg_part.password_confirm
            formmsg_part.query = "form";
            sendMessage(JSON.stringify(formmsg_part));
        }
        if (lastMessage !== null) {
            let msg = JSON.parse(lastMessage.data);
            switch (msg.type){
                case "zxcvbn":
                    setPasswordCheck( (passwordCheck) => {
                        let pcheck = passwordCheck;

                        if(msg.content !== null){
                            if (pcheck === undefined){
                                //let initialPassword = new Map()
                                pcheck.set(msg.content.password , msg.content);
                            }
                            if (!pcheck.has(msg.content.password)){
                                pcheck.set(msg.content.password , msg.content);
                            }
                        }
                    //console.log(pcheck)
                    return pcheck;
                    })
                    break
                case "form":
                    setFormCheck((formCheck) => {
                        let fcheck = formCheck;
                        let formstring = formString(msg.original);
                        if (fcheck === undefined){
                            //fcheck = new Map()
                            fcheck.set(formstring, msg.content);
                        }
                        if (!fcheck.has(formstring)){
                            fcheck.set(formstring, msg.content);
                        }
                    //console.log(fcheck)
                        return fcheck;
                    })
                    break;
                default:
                    break;
            }
       }
    }, [lastMessage, sendMessage, formCheck, formData]);

    useEffect(() => {
        setValues((values) =>{
            return {
                current: formData,
                forms: formCheck,
                passwords: passwordCheck
            };
        })
    },[passwordCheck, formCheck, formData])

    const onChange = (event) => {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name] : event.target.value
            };
        })
    }
 
    const onSubmit = (event) => {
        event.preventDefault();
        console.log("pushed");
    }
    const onPassWordChange = (event) => {
        if(!passwordCheck.has(event.target.value)){
            let pwmsg = {
                password: event.target.value, 
                query: "zxcvbn"
            } ;
            sendMessage(JSON.stringify(pwmsg));
        }
    }

    const onRegister = async (event) => {
        try {
            const res = await axios.post(`${server}/register`,formData );
            console.log(res.data);
            notification("Registration", "User was succesfully registered")
            navigate('/login')
        } catch (err){
            console.error(err)
            notification("Registration", "Registration failed", "error")
        }
    }

    const navigate = useNavigate()
    useEffect(() =>{
        if(sessionStatus){
            navigate('/alarms')
        }
    },[sessionStatus, navigate])
    return (
        <Box bg='lightgray' className='UserForm' >
        <FormControl onSubmit={onSubmit} width="95%" margin="0 auto" >
            <FormLabel htmlFor="firstname">First name (Optional)</FormLabel>
            <Input type="text"
                name="firstname"
                id="firstname"
                onChange={onChange}
                value={formData.firstname}
                className='Register'
            />
            <FormLabel htmlFor="lastname">Last name (Optional)</FormLabel>
            <Input type="text"
                bgColor="GhostWhite"
                name="lastname"
                id="lastname"
                onChange={onChange}
                value={formData.lastname}
                className='Register'
            />
            <FormLabel htmlFor="email">Email (Required)</FormLabel>
            <Input type="email"
                name="email"
                id="email"
                onChange={onChange}
                value={formData.email}
                className='Register'
            />
            <FormLabel htmlFor='password'>Password</FormLabel>
            <InputGroup>
                <Input type="password"
                    name="password"
                    id="password"
                    onChange= {(e) => {onPassWordChange(e) ; onChange(e)}}
                    value={formData.password}
                    className='Register'
                />
                <InputRightAddon children={<RegisterPasswordCheck values={values} />}/>
            </InputGroup>
            
            <FormLabel htmlFor='password_confirm'>Confirm Password</FormLabel>
            <InputGroup>
                <Input type="password"
                    name="password_confirm"
                    id="password_confirm"
                    onChange= {onChange}
                    value={formData.password_confirm}
                    className='Register'
                />
                <InputRightAddon children={<PasswordMatch values={values}/>}/>
            </InputGroup>
            <RegisterSubmit values={values} onRegister={onRegister} />
        </FormControl> 
        </Box>
    )
}

export default Register;
