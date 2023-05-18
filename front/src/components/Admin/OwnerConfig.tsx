import {  HStack, Spacer, Stack, Text,
    Button, Box, VStack, Input, FormLabel,
    Switch,  Checkbox,   NumberInput, Center,
    NumberInputField, NumberInputStepper,
    NumberIncrementStepper,  NumberDecrementStepper, } from '@chakra-ui/react'
import React, { useEffect, useState, useRef } from 'react'
import { extend, useAdmin, useLogIn } from '..//../stores' 
import { useNavigate } from "react-router-dom"
import { Path } from '../../type'

//ownerId":"6461f3091330e40a7e528abc","urlDB":"0.0.0.0:27017","customUri":"","userDb":"root","useCustomUri":false,"passwordDb":"example","email":"","password":"","emailPort":"","emailServer":"","emailPlainAuth":false,"activateAuto":false,"activateEmai

function OwnerConfig() {
const navigate = useNavigate()

const inputHideShow = {
    passwordDb: false,
    passwordEmail: false,
    dbURI: false,
    ownerID : false       
}
const [ inputs , setInputs ] = useState(inputHideShow)
const ownerConfig = useAdmin((state) => state.ownerConfig)
const setOwnerConfig = useAdmin((state) => state.setOwnerConfig)
const getOwnerConfig = useAdmin((state) => state.getOwnerConfig)
const sendConfiguration = useAdmin((state) => state.sendOwnerConfig)
const isOwner = useLogIn((state) => state.user.owner)
const defaultOwnerConfig = {
    ownerId:"",
    urlDB:"",
    customUri:"",
    userDb:"",
    useCustomUri:false,
    passwordDb:"",
    email:"",
    password:"",
    emailIdentity:"",
    emailPort:0,
    emailServer:"",
    emailPlainAuth:false,
    activateAuto:false,
    activateEmail:false
}
useEffect(() => {
    getOwnerConfig()
}, [])
useEffect(() => {
    if (!isOwner) {
        navigate(extend(Path.Admin))
    }
}, [])

return (
        <>
            <Box
                backgroundColor={"gray.50"}
                borderRadius={"md"}
                m={"2%"}
            >   
                <Box>
                    
                    <FormLabel
                        m="2%"
                    >
                        Owner ID
                    </FormLabel>
                    <HStack>
                        <Input
                            type={inputs.ownerID?"text":"password"}
                            value={ownerConfig?.ownerId?ownerConfig.ownerId:""}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,ownerId:e.target.value})}
                            backgroundColor={"ghostwhite"}
                            w={"95%"}
                        />
                        <Button
                            onClick={() => {setInputs({...inputs,ownerID:!inputs.ownerID})}}
                        >
                            {inputs.ownerID?"Hide":"Show"}
                        </Button>
                    </HStack>
                </Box>
                <Checkbox
                    isChecked={(ownerConfig)?ownerConfig.useCustomUri:false}
                    onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,useCustomUri:e.target.checked})}
                >
                    Use Custom URI
                </Checkbox>
                {(ownerConfig && ownerConfig.useCustomUri)?<><FormLabel>
                    Custom URI
                </FormLabel>
                <HStack>
                    <Input
                        type={inputs.dbURI?"text":"password"}
                        value={ownerConfig?.customUri?ownerConfig.customUri:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,customUri:e.target.value})}
                        backgroundColor={"ghostwhite"}
                        w={"95%"}
                    />
                    <Button
                        onClick={() => {setInputs({...inputs,dbURI:!inputs.dbURI})}}
                    >
                        {inputs.dbURI ?"Hide":"Show"}
                    </Button>
                </HStack>
                </>:<></>}
                {(ownerConfig && !ownerConfig.useCustomUri)? <>
                <Box>
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
                </Box>
                <Box>
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
                </Box>
                <Box>
                    <FormLabel
                        m="2%"
                    >
                        Password
                    </FormLabel>
                    <HStack>
                        <Input
                            type={inputs.passwordDb?"text":"password"}
                            value={ownerConfig?.passwordDb?ownerConfig.passwordDb:""}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,passwordDb:e.target.value})}
                            backgroundColor={"ghostwhite"}
                        />
                        <Button
                            onClick={() => {setInputs({...inputs,passwordDb:!inputs.passwordDb})}}
                        >
                            {inputs.passwordDb?"Hide":"Show"}
                        </Button>
                    </HStack>
                </Box>
                </>:<></>}
                <Text>DB configuration</Text>
            </Box>
            <Box
                backgroundColor={"red.50"}
                borderRadius={"md"}
            >
                <Box>
                    <FormLabel
                    >
                        Email Address
                    </FormLabel>
                    <Input
                        type="text"
                        value={ownerConfig?.email?ownerConfig.email:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,email:e.target.value})}
                        backgroundColor={"ghostwhite"}
                    />
                </Box>
                <Box>
                    <FormLabel
                    >
                        Identity
                    </FormLabel>
                    <Input
                        type="text"
                        value={ownerConfig?.emailIdentity?ownerConfig.emailIdentity:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,emailIdentity:e.target.value})}
                        backgroundColor={"ghostwhite"}
                    />
                </Box>
                <Box>
                    <HStack
                        mt="2%"
                    >
                        <VStack>
                        <FormLabel
                        >
                            Server
                        </FormLabel>
                        <Input
                            type="text"
                            value={ownerConfig?.emailServer?ownerConfig.emailServer:""}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,emailServer:e.target.value})}
                            backgroundColor={"ghostwhite"}
                            width={"350px"}
                        />
                        </VStack>
                        <VStack>
                            <FormLabel
                            >
                                Port
                            </FormLabel>
                            <NumberInput
                                width={"100px"}
                                min={0} 
                                max={9000}
                                value=  {ownerConfig?.emailPort?ownerConfig.emailPort:0}
                                onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,emailPort:parseInt(e)})}
                            >
                                <NumberInputField
                                    backgroundColor={"ghostwhite"}
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </VStack>
                    </HStack>
                </Box>
                <Box>
                <FormLabel
                    m="2%"
                >
                    Email Password
                </FormLabel>
                <HStack>
                    <Input
                        type={inputs.passwordEmail?"text":"password"}
                        value={ownerConfig?.password?ownerConfig.password:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,password:e.target.value})}
                        backgroundColor={"ghostwhite"}
                    />
                    <Button
                        onClick={() => {setInputs({...inputs,passwordEmail:!inputs.passwordEmail})}}
                    >
                        {inputs.passwordEmail?"Hide":"Show"}
                    </Button>
                </HStack>
                </Box>
                <HStack 
                    m="2%"
                >
                    <Spacer/>
                    <VStack> 
                        <FormLabel>
                            PlainAuth
                        </FormLabel>
                        <Switch
                            isChecked={ownerConfig?.emailPlainAuth?ownerConfig.emailPlainAuth:false}   
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,emailPlainAuth:e.target.checked})}
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
                            isDisabled={ownerConfig?.activateAuto}
                        />
                    </VStack>
                    <Spacer/>
                </HStack>
                <Text>
                    SMTP configuration
                </Text>
            </Box>
            <Button
                onClick={() => {
                    sendConfiguration()
                    navigate(extend(Path.Admin))
                    }
                }
            >
                Apply
            </Button>
            <Button
                onClick={() => navigate(extend(Path.Admin))}
                m="2%"
            >
                Cancel
            </Button>
        </>
    )
}
export default OwnerConfig