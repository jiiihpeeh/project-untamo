import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Table, Thead, Tbody, Tr,Th,Td, TableContainer,
         Switch, IconButton, Box, VStack } from "@chakra-ui/react"
import { DeleteIcon } from '@chakra-ui/icons'
import AdminConfirm from "./AdminConfirm"
import { usePopups, useLogIn, useAdmin, extend } from "../../stores"
import { AdminAction, Path } from '../../type'

function Admin() {
    const navigate = useNavigate()
    const userInfo = useLogIn((state) => state.user)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const adminTime = useAdmin((state) => state.time)
    const usersData = useAdmin((state) => state.usersData)
    const getUsersData = useAdmin((state) => state.getUsersData)
    const setConfirmOpen = usePopups((state) => state.setShowAdminConfirm)
    const isOwner = useLogIn((state) => state.user.owner)

    function userActive(id: string, active: boolean, owner: boolean, currentUser: boolean, key: number) {
        return (
            <Switch
                key={key}
                isChecked={active}
                onChange={() => initChangeActivity(id)}
                isDisabled={owner || currentUser} />
        )
    }
    function userAdmin(id: string, admin: boolean, owner: boolean, currentUser: boolean, key: number) {
        return (
            <Switch
                key={key}
                isChecked={admin}
                onChange={() => initChangeAdminState(id)}
                isDisabled={owner || currentUser} />
        )
    }
    function userDelete(id: string, owner: boolean, currentUser: boolean, key: number) {
        return (
            <IconButton
                key={key}
                onClick={() => initDelete(id)}
                isDisabled={owner || currentUser}
                backgroundColor={"red"}
                icon={<DeleteIcon />}
                aria-label="" />
        )
    }
    function initDelete(id: string) {
        useAdmin.setState({ command: { id: id, action: AdminAction.Delete } })
        setConfirmOpen(true)
    }
    function initChangeActivity(id: string) {
        useAdmin.setState({ command: { id: id, action: AdminAction.Activity } })
        setConfirmOpen(true)
    }
    const initChangeAdminState = (id: string) => {
        useAdmin.setState({ command: { id: id, action: AdminAction.Admin } })
        setConfirmOpen(true)
    }

    const renderUsers = () => {
        if (!usersData) {
            return ([] as Array<JSX.Element>)
        }
        return usersData.map(({ active, admin, owner, email, userID }, key) => {
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
            )
        })
    }

    useEffect(() => {
        if (!sessionStatus || (adminTime < Date.now())) {
            navigate(extend(Path.Alarms))
        }
    }, [adminTime, sessionStatus])
    useEffect(() => {
        const getInfo = async () => {
            getUsersData()
        }
        getInfo()
    }, [])
    useEffect(() => {
        renderUsers()
    }, [usersData, renderUsers])
    return (<Box>
        <VStack>
            <Button
                onClick={getUsersData}
                mt="30px"
                key="userDataGet"
            >
                Update User List
            </Button>
            <Button
                onClick={() => navigate(extend(Path.Owner))}
                isDisabled={!isOwner}
                m="30px"
            >
                Server Configuration (Owner Only)
            </Button>
        </VStack>
        <TableContainer
            key="TableContainer"
            width={"100%"}
            style={{ left: 0, position: "absolute" }}
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

        <AdminConfirm />

    </Box>
    )
}

export default Admin