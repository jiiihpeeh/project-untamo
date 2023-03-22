import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Table, Thead, Tbody, Tr,Th,Td,
         TableContainer, Switch, IconButton, Box, HStack, VStack } from "@chakra-ui/react"
import { DeleteIcon } from '@chakra-ui/icons'
import AdminConfirm from "./AdminConfirm"
import { usePopups, useLogIn, useAdmin, extend } from "../../stores"
import { AdminAction} from '../../type'

const Admin = () => {
    const navigate = useNavigate()
    const userInfo = useLogIn((state)=> state.user)
    const sessionStatus = useLogIn((state) => state.sessionValid)

    const setAdminToken = useAdmin((state)=> state.setToken)
    const adminTime = useAdmin((state)=> state.time)
    const setAdminTime = useAdmin((state)=> state.setTime)
    const usersData = useAdmin((state)=> state.usersData)
    const getUsersData = useAdmin((state)=> state.getUsersData)
    const setConfirmOpen = usePopups((state)=>state.setShowAdminConfirm)


    const userActive = (id: string, active:boolean, owner: boolean, currentUser: boolean, key:number) =>{
        return(
            <Switch 
                key={key}
                isChecked={active} 
                onChange={() => initChangeActivity(id)}
                isDisabled={owner || currentUser}
            />
        )
    }
    const userAdmin = (id: string, admin: boolean, owner: boolean, currentUser: boolean,key:number) =>{
        return(
            <Switch 
                key={key}
                isChecked={admin} 
                onChange={() => initChangeAdminState(id)}
                isDisabled={owner || currentUser}
            />
        )
    }    
    const userDelete = (id: string, owner: boolean, currentUser: boolean, key:number) =>{
        return(
            <IconButton
                key={key}
                onClick={() => initDelete(id)}
                isDisabled={owner || currentUser}
                backgroundColor={"red"}
                icon={<DeleteIcon />}
                aria-label=""
            />
        )
    }
    const initDelete = (id: string) => {
        useAdmin.setState({command:{id:id, action: AdminAction.Delete}})
        setConfirmOpen(true)
    }
    const initChangeActivity = (id: string) => {
        useAdmin.setState({command:{id:id, action: AdminAction.Activity}})
        setConfirmOpen(true)
    }
    const initChangeAdminState = (id: string) => {
        useAdmin.setState({command:{id:id, action: AdminAction.Admin}})
        setConfirmOpen(true)
    }

    const renderUsers = () => {
        if(!usersData){
            return ([] as Array<JSX.Element>)
        }
        return usersData.map(({ active, admin, owner, email, userID },key) => {
			return (
					<Tr 
                        key={`user-${key}`}
                    >
						<Td>
                            {userID}
                        </Td>
						<Td>
                            {email}
                        </Td>
						<Td>
                            {userActive(userID, active, owner, userInfo.email === email, key)}
                        </Td>
						<Td>
                            {userAdmin(userID, admin, owner, userInfo.email === email, key)}
                        </Td>
						<Td>
                            {userDelete(userID, owner, userInfo.email === email, key)}
                        </Td>
                    </Tr>
            )})
    }

    useEffect(() => {
        if(!sessionStatus || (adminTime < Date.now())){
            navigate(extend('/alarms'))
        }
    },[adminTime, sessionStatus])
    useEffect(() => {
        const getInfo = async () =>{
           getUsersData()
        }
        //console.log(userData)
        getInfo()
    },[])
    useEffect(() => {
        //console.log(userData)
        renderUsers()
    },[usersData, renderUsers])
    return(<Box>
            <VStack>
                <Button 
                    onClick={getUsersData}  
                    mt="30px"
                    key="userDataGet"
                >
                    Update User List
                </Button>
            </VStack>
                <TableContainer
                    key="TableContainer"
                    width={"100%"}
                    style={{left:0, position:"absolute"}}
                >
                <Table 
                    variant='striped'
                    key="userTable"
                    id="Admin-Table"
                    alignContent={"center"}
                    alignItems={"center"}
                >
                    <Thead
                        key="table-Header"
                    >
                    <Tr 
                        key="header-Rows"
                    >
                        <Th
                            key="header-ID"
                        >
                            ID
                        </Th>
                        <Th>
                            User
                        </Th>
                        <Th
                            key="header-active"
                        >
                            Active
                        </Th>
                        <Th
                            key="header-admin"
                        >
                            Admin
                        </Th>
                        <Th
                            key="header-delete"
                        >
                            Delete
                        </Th>
                    </Tr>
                    </Thead>
                    <Tbody
                        key="TableContent"
                    >
                        {renderUsers()}
                    </Tbody>

                </Table>
                </TableContainer>
                <AdminConfirm/>

           </Box>
        )
}

export default Admin