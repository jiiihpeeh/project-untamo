import React, {useState, useEffect, useContext} from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../contexts/AdminContext";
import { SessionContext } from "../contexts/SessionContext";
import axios from "axios";
import { Button, Table,
    Thead, Tbody,
    Tr,Th,Td,
    TableContainer, Switch,
    IconButton} from "@chakra-ui/react";
import { DeleteIcon } from '@chakra-ui/icons'
import AdminConfirm from "./AdminConfirm";

const Admin = () => {
    const navigate = useNavigate();
    const {token, sessionStatus, server, userInfo } = useContext(SessionContext);
    const { adminToken, adminTime, setAdminToken, setAdminTime } = useContext(AdminContext);
    const [ userData, setUserData ] = useState([]);
    const [ confirmOpen, setConfirmOpen ] = useState(false);
    const [ command, setCommand ] = useState({id:null, action:null});

    const fetcher = async () => {
        try{
            let res = await axios.get(`${server}/admin/users`, {
                headers:{
                    token: token, 
                    adminToken: adminToken
                }
            })
            setUserData(res.data)
        }catch(err){
            console.log(err)
        }
    }
 
 
    const userActive = (id, active, owner, currentUser) =>{
        return(
            <Switch isChecked={active} 
                    onChange={() => initChangeActivity(id)}
                    isDisabled={owner || currentUser}
            />
        )
    }
    const userAdmin = (id, admin, owner,currentUser) =>{
        return(
            <Switch isChecked={admin} 
                    onChange={() => initChangeAdminState(id)}
                    isDisabled={owner || currentUser}
            />
        )
    }    
    const userDelete = (id, owner, currentUser) =>{
        return(
            <IconButton
                    onClick={() => initDelete(id)}
                    isDisabled={owner || currentUser}
                    backgroundColor={"red"}
                    icon={<DeleteIcon />}
            />
        )
    }
    const initDelete = (id) => {
        setCommand({id:id, action: 'delete'})
        setConfirmOpen(true)
    }
    const initChangeActivity = (id) => {
        setCommand({id:id, action: 'activity'})
        setConfirmOpen(true)
    }
    const initChangeAdminState = (id) => {
        setCommand({id:id, action: 'admin'})
        setConfirmOpen(true)
    }

    const renderUsers = () => {
        if(!userData){
            return
        }
        return userData.map(({ active, admin, owner, user, userID },key) => {
			return (
					<>
					<Tr key={`user-item-${userID}`}>
						<Td>{userID}</Td>
						<Td>{user}</Td>
						<Td>
                            {userActive(userID, active, owner, userInfo.user === user)}
                        </Td>
						<Td>
                            {userAdmin(userID, admin, owner, userInfo.user === user)}
                        </Td>
						<Td>
                            {userDelete(userID, owner, userInfo.user === user)}
                        </Td>
                    </Tr>
                    </>
            )})
    }

    useEffect(() => {
        if(!sessionStatus || (adminTime < Date.now())){
            navigate('/alarms');
        }
    },[adminTime, navigate, sessionStatus])
    useEffect(() => {
        const getInfo = async () =>{
           await fetcher();
        }
        //console.log(userData);
        getInfo();
    },[])
    useEffect(() => {
        //console.log(userData);
        renderUsers();
    },[userData, renderUsers])
    return(<>
                <Button onClick={fetcher}  m="30px">Update User List</Button>
                <TableContainer>
                <Table variant='simple'>
                    <Thead>
                    <Tr>
                        <Th>ID</Th>
                        <Th>User</Th>
                        <Th>Active</Th>
                        <Th>Admin</Th>
                        <Th>Delete</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                        {renderUsers()}
                    </Tbody>

                </Table>
                </TableContainer>
                <AdminConfirm 
                        confirmOpen={confirmOpen}
                        setConfirmOpen={setConfirmOpen}
                        command={command}
                        setUserData={setUserData}
                        userData={userData}
                        setCommand={setCommand}
                />
                <Button onClick={()=>{setAdminToken(''); setAdminTime(0)}} m="10px">End Admin Session</Button>
           </>
        )
}

export default Admin;