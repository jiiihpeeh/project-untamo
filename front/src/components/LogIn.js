import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";

const LogInSubmit = (props) => {
    return (
        <input type="submit" value="LogIn" id="submit"/>
    )
};

const LogIn = () => {

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
            let res = await axios.post('http://localhost:3001/login', formData);
            console.log(res.data)
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("user", res.data.user)
            localStorage.setItem("screenname", res.data.screenname)
            localStorage.setItem("firstname", res.data.firstname)
            localStorage.setItem("lastname", res.data.lastname)
            return navigate('/welcome')
        }catch(err){
            console.error(err)
        }

    }
    const navigate = useNavigate()
    return (
        <form onSubmit={onSubmit}>
            <label htmlFor="user">Email</label>
            <input type="email"
                name="user"
                id="user"
                onChange={onChange}
                value={formData.user}
            />
            <br/>
            <label htmlFor='password'>Password</label>
            <input type="password"
                name="password"
                id="password"
                onChange= {onChange}
                value={formData.password}
            />
            <br/>
            <LogInSubmit />
        </form> 
    )
}

export default LogIn;
