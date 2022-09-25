import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
    const [user, setUser] = useState ({
        user:(localStorage['user']) ? localStorage['user'] :'',
        firstname:(localStorage['firstname']) ? localStorage['firstname'] :'',
        lastname:(localStorage['lastname']) ? localStorage['lastname'] :'',
        screen_name:(localStorage['screenname']) ? localStorage['screenname'] :'',
    })
    const  navigate = useNavigate()
    useEffect(() => {
        if(!localStorage['user']){
            navigate('/login')
        }
    },[user])
    return(
        <>
            <div>
                <h2>Tere tere, {user.screen_name}!</h2>
            </div>
        </>
    )
}

export default Welcome;