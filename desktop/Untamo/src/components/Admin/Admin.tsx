import React, { useEffect } from "react"
import { Button, Table, Thead, Tbody, Tr,Th,Td, TableContainer,
         Switch, IconButton, Box, VStack, Card, Flex, Container, Center, Spacer, HStack } from "@chakra-ui/react"
import { DeleteIcon } from '@chakra-ui/icons'
import AdminConfirm from "./AdminConfirm"
import { usePopups, useLogIn, useAdmin } from "../../stores"
import { AdminAction, Path } from '../../type'

function Admin() {
    const userInfo = useLogIn((state) => state.user)
    const sessionStatus = useLogIn((state) => state.sessionValid)
    const adminTime = useAdmin((state) => state.time)
    const usersData = useAdmin((state) => state.usersData)
    const getUsersData = useAdmin((state) => state.getUsersData)
    const setConfirmOpen = usePopups((state) => state.setShowAdminConfirm)
    //const navigateTo = useLogIn((state) => state.navigateTo)
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)
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
        if (!usersData || usersData.length === 0) {
            return ([] as Array<JSX.Element>)
        }
        return usersData.map(({ active, admin, owner, email, user }, key) => {
            return (
                <Card key={`user-${key}`} p={4} mb={4} bg="teal.50">
                    <Flex justify="space-between" align="center">
                        <VStack>
                            <HStack>
                                <Box>
                                    <strong>ID:</strong> {user}
                                </Box>
                                <Spacer />
                                <Box>
                                    <strong>Email:</strong> {email}
                                </Box>
                            </HStack>
                            <HStack>
                                <Box>
                                    <strong>Active:</strong> {userActive(user, active, owner, userInfo.email === email, key)}
                                </Box>
                                <Spacer />
                                <Box>
                                    <strong>Admin:</strong> {userAdmin(user, admin, owner, userInfo.email === email, key)}
                                </Box>
                                <Spacer />
                                <Box>
                                    <strong>Delete:</strong> {userDelete(user, owner, userInfo.email === email, key)}
                                </Box>
                            </HStack>
                        </VStack>
                    </Flex>
                </Card>
            )
        })
    }

    useEffect(() => {
        if (!sessionStatus || (adminTime < Date.now())) {
            setNavigateTo(Path.Alarms)
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
    return (
        <Center>
            <Box>
                <VStack>
                    <Button
                        onClick={getUsersData}
                        mt="30px"
                        key="userDataGet"
                    >
                        Update User List
                    </Button>
                    <Button
                        onClick={() => setNavigateTo(Path.Owner)}
                        isDisabled={!isOwner}
                        m="30px"
                    >
                        Server Configuration (Owner Only)
                    </Button>
                </VStack>
                
                <Container>
                    {renderUsers()}
                </Container>
                

                <AdminConfirm />

            </Box>
            </Center>
    )
}

export default Admin