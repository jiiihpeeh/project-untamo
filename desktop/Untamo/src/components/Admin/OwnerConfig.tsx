import {  HStack, Spacer,
    Button, Box, VStack, Input, FormLabel,
    Switch,  Checkbox } from '@chakra-ui/react'
import React, { useEffect, useState, useRef } from 'react'
import { useAdmin } from '..//../stores' 
import { useNavigate } from "react-router-dom"
import { Path } from '../../type'

//ownerId":"6461f3091330e40a7e528abc","urlDB":"0.0.0.0:27017","customUri":"","userDb":"root","useCustomUri":false,"passwordDb":"example","email":"","password":"","emailPort":"","emailServer":"","emailTLS":false,"activateAuto":false,"activateEmai

function OwnerConfig() {
const navigate = useNavigate()

const [showPasswordDb, setShowPasswordDb] = useState(false)
const [showPasswordEmail, setShowPasswordEmail] = useState(false)
const ownerConfig = useAdmin((state) => state.ownerConfig)
const setOwnerConfig = useAdmin((state) => state.setOwnerConfig)
const getOwnerConfig = useAdmin((state) => state.getOwnerConfig)
const sendConfiguration = useAdmin((state) => state.sendOwnerConfig)
const defaultOwnerConfig = {
    ownerId:"",
    urlDB:"",
    customUri:"",
    userDb:"",
    useCustomUri:false,
    passwordDb:"",
    email:"",
    password:"",
    emailPort:-5,
    emailServer:"",
    emailTLS:false,
    activateAuto:false,
    activateEmail:false
}
useEffect(() => {
    getOwnerConfig()
}, [])


useEffect(() => {
    console.log(ownerConfig)
}, [ownerConfig])

return (
        <>
            <Box
                backgroundColor={"gray.50"}
                borderRadius={"md"}
                m={"2%"}
            >
                <Checkbox
                    isChecked={(ownerConfig)?ownerConfig.useCustomUri:false}
                    onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,useCustomUri:e.target.checked})}
                >
                    Use Custom URI
                </Checkbox>
                {(ownerConfig && ownerConfig.useCustomUri)?<><FormLabel>
                    Custom URI
                </FormLabel>
                <Input
                    type="text"
                    value={ownerConfig?.customUri?ownerConfig.customUri:""}
                    onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,customUri:e.target.value})}
                    backgroundColor={"ghostwhite"}
                    w={"95%"}
                /></>:<></>}
                {(ownerConfig && !ownerConfig.useCustomUri)? <>
                <HStack>
                    <FormLabel
                        m="2%"
                    >
                        DB base URI
                    </FormLabel>
                    <Input
                        type="text"
                        value={ownerConfig?.urlDB?ownerConfig.urlDB:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,urlDB:e.target.value})}
                        backgroundColor={"ghostwhite"}
                        width={"95%"}
                    />
                </HStack>
                <HStack>
                    <FormLabel
                        m="2%"
                    >                            
                        User for DB
                    </FormLabel>
                    <Input
                        type="text"
                        value={ownerConfig?.userDb?ownerConfig.userDb:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,userDb:e.target.value})}
                        backgroundColor={"ghostwhite"}
                    />
                </HStack>
                <HStack>
                    <FormLabel
                        m="2%"
                    >
                        Password
                    </FormLabel>
                    <Input
                        type={showPasswordDb?"text":"password"}
                        value={ownerConfig?.passwordDb?ownerConfig.passwordDb:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,passwordDb:e.target.value})}
                        backgroundColor={"ghostwhite"}
                    />
                    <Button
                        onClick={() => setShowPasswordDb(!showPasswordDb)}
                    >
                        {showPasswordDb?"Hide":"Show"}
                    </Button>
                </HStack>
                </>:<></>}
            </Box>
            <Box
                backgroundColor={"red.50"}
                borderRadius={"md"}
                m={"2%"}
            >
                <HStack>
                    <FormLabel
                        m="2%"
                    >
                        Email
                    </FormLabel>
                    <Input
                        type="text"
                        value={ownerConfig?.email?ownerConfig.email:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,email:e.target.value})}
                        backgroundColor={"ghostwhite"}
                        w={"95%"}
                    />
                </HStack>
                <HStack>
                <FormLabel
                    m="2%"
                >
                    Email Password
                </FormLabel>
                <Input
                    type={showPasswordEmail?"text":"password"}
                    value={ownerConfig?.password?ownerConfig.password:""}
                    onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,password:e.target.value})}
                    backgroundColor={"ghostwhite"}
                    w={"95%"}
                />
                <Button
                    onClick={() => setShowPasswordEmail(!showPasswordEmail)}
                >
                    {showPasswordEmail?"Hide":"Show"}
                </Button>
                </HStack>
                <HStack>
                    <FormLabel
                        m="2%"
                    >
                        Email Port
                    </FormLabel>
                    <Input
                        type="number"
                        value={ownerConfig?.emailPort?ownerConfig.emailPort:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,emailPort:parseInt(e.target.value)})}
                        backgroundColor={"ghostwhite"}
                    />
                </HStack>
                <HStack
                >
                    <Spacer/>
                    <VStack> 
                        <FormLabel>
                            Email TLS
                        </FormLabel>
                        <Switch
                            isChecked={ownerConfig?.emailTLS?ownerConfig.emailTLS:false}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,emailTLS:e.target.checked})}
                            backgroundColor={"ghostwhite"}
                        />
                    </VStack>
                    <Spacer/>
                    <VStack>
                        <FormLabel>
                            Activate Automatically
                        </FormLabel>
                        <Switch
                            isChecked={ownerConfig?.activateAuto?ownerConfig.activateAuto:false}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,activateAuto:e.target.checked})}
                            backgroundColor={"ghostwhite"}
                        />
                    </VStack>
                    <Spacer/>
                    <VStack>
                        <FormLabel>
                            Email Activation
                        </FormLabel>
                        <Switch
                            isChecked={ownerConfig?.activateEmail?ownerConfig.activateEmail:false}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,activateEmail:e.target.checked})}
                            backgroundColor={"ghostwhite"}
                        />
                    </VStack>
                    <Spacer/>
                </HStack>
            </Box>
            <Button
                onClick={() => {
                    sendConfiguration()
                    navigate(Path.Admin)
                    }
                }
            >
                Apply
            </Button>
        </>
    )
}
export default OwnerConfig