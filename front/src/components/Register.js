 
import { useState, useEffect } from 'react'
import './registerComponents/registerCheck.css'
import useWebSocket from 'react-use-websocket';
import { formString } from './registerComponents/formString';
import RegisterPasswordCheck from './registerComponents/RegisterPasswordCheck';
import { wsURL } from './registerComponents/registerConst';
import RegisterSubmit from './registerComponents/RegisterSubmit';

import axios from 'axios'


const Register = (props) => {
    
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: ""
    })
    const [socketUrl, setSocketUrl] = useState(wsURL)
    const [passwordCheck, setPasswordCheck] = useState(new Map())
    const [formCheck, setFormCheck] = useState(new Map())
    const [values, setValues] = useState({
        passwords: {},
        forms: {},
        current: {}
    })

    const { sendMessage, lastMessage } = useWebSocket(socketUrl);
  
    useEffect(() => {
        if(!formCheck.has(formString(formData))){
            let formmsg = Object.assign({},formData)
            formmsg.query = "form"
            sendMessage(JSON.stringify(formmsg))
        }
        if (lastMessage !== null) {
            let msg = JSON.parse(lastMessage.data)
            switch (msg.type){
                case "zxcvbn":
                    setPasswordCheck( (passwordCheck) => {
                        let pcheck = passwordCheck

                        if(msg.content !== null){
                            if (pcheck === undefined){
                                //let initialPassword = new Map()
                                pcheck.set(msg.content.password , msg.content)
                            }
                            if (!pcheck.has(msg.content.password)){
                                pcheck.set(msg.content.password , msg.content)
                            }
                        }
                    //console.log(pcheck)
                    return pcheck
                    })
                    break
                case "form":
                    setFormCheck((formCheck) => {
                        let fcheck = formCheck
                        let formstring = formString(msg.original)
                        if (fcheck === undefined){
                            //fcheck = new Map()
                            fcheck.set(formstring, msg.content)
                        }
                        if (!fcheck.has(formstring)){
                            fcheck.set(formstring, msg.content)
                        }
                    //console.log(fcheck)
                        return fcheck
                    })
                    break
            default:
                break
            }
       }
    }, [lastMessage, sendMessage, formCheck, formData]);

    useEffect(() => {
        setValues((values) =>{
            return {
                current: formData,
                forms: formCheck,
                passwords: passwordCheck
            }
        })
    },[passwordCheck, formCheck, formData])

    const onChange = (event) => {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name] : event.target.value
            }
        })

    }
 
    const onSubmit = (event) => {
        event.preventDefault()
        console.log("pushed")
    }
    const onPassWordChange = (event) => {
        if(!passwordCheck.has(event.target.value)){
            let pwmsg = {
                password: event.target.value, 
                query: "zxcvbn"
            } 
            sendMessage(JSON.stringify(pwmsg))
        }
    }

    const onRegister = async (event) => {
        const res = await axios.post('http://localhost:3001/register',formData );
        console.log(res)
    }


    return (
        <form onSubmit={onSubmit}>
            <label htmlFor="firstname">First name</label>
            <input type="text"
                name="firstname"
                id="firstname"
                onChange={onChange}
                value={formData.firstname}
            />
            <br/>
            <label htmlFor="lastname">Last name</label>
            <input type="text"
                name="lastname"
                id="lastname"
                onChange={onChange}
                value={formData.lastname}
            />
            <br/>
            <label htmlFor="email">Email</label>
            <input type="email"
                name="email"
                id="email"
                onChange={onChange}
                value={formData.email}
            />
            <br/>
            <label htmlFor='password'>Password</label>
            <input type="password"
                name="password"
                id="password"
                onChange= {(e) => {onPassWordChange(e) ; onChange(e)}}
                value={formData.password}
            />
            <RegisterPasswordCheck values={values} />
            <br/>
            <RegisterSubmit values={values} onRegister={onRegister} />
        </form> 
    )
}

export default Register
