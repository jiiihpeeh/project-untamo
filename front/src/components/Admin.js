import React, {useState, useEffect, useContext} from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../contexts/AdminContext";
import { SessionContext } from "../contexts/SessionContext";
import axios from "axios";
import { Button } from "@chakra-ui/react";
const Admin = () => {
    const navigate = useNavigate();
    const {token, sessionStatus, server} = useContext(SessionContext);
    const { adminToken, adminTime } = useContext(AdminContext);

    const fetcher = async () => {
        console.log("HI")
        try{
            let res = await axios.get(`${server}/admin/users`, {
                headers:{
                    token: token, 
                    adminToken: adminToken
                }
            })
            console.log(res.data)
        }catch(err){
            console.log(err)
        }
    } 

    useEffect(() => {
        if(!sessionStatus || (adminTime < Date.now())){
            navigate('/alarms');
        }
    },[])
    return(<>
                <Button onClick={fetcher}>Get users</Button>
           </>)
}

export default Admin;