import {  HStack, Spacer, Stack, Text,
    Button, Box, VStack, Input, FormLabel,
    Switch,  Checkbox,   NumberInput, Center,
    NumberInputField, NumberInputStepper,
    NumberIncrementStepper,  NumberDecrementStepper, Heading, } from '@chakra-ui/react'
import React, { useEffect, useState   } from 'react'
import {   useAdmin, useLogIn, useSettings } from '../../stores' 
import { DatabaseType } from '../../stores/adminStore'
import { ColorMode, Path } from '../../type'


//ownerId":"6461f3091330e40a7e528abc","urlDB":"0.0.0.0:27017","customUri":"","userDb":"root","useCustomUri":false,"passwordDb":"example","email":"","password":"","emailPort":"","emailServer":"","emailPlainAuth":false,"activateAuto":false,"activateEmail

function Owner() {
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
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)
    const colorMode = useSettings((state) => state.colorMode)
    interface Timing {
        years:number,
        months:number,
        days:number,
        hours:number,
        minutes:number,
        seconds:number
    }
    const [ timing , setTiming ] = useState<Timing>({years:0,months:0,days:0,hours:0,minutes:0,seconds:0})
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
        activateEmail:false,
        sessionLength: 63072000000,
        databaseType: DatabaseType.Mongo,
        databasePath: ""
    }
    function msInYearsMonthsDaysHoursMinutesSeconds(ms:number):Timing{
        const years = Math.floor(ms / 31536000000)
        const months = Math.floor((ms % 31536000000) / 2592000000)
        const days = Math.floor(((ms % 31536000000) % 2592000000) / 86400000)
        const hours = Math.floor((((ms % 31536000000) % 2592000000) % 86400000) / 3600000)
        const minutes = Math.floor(((((ms % 31536000000) % 2592000000) % 86400000) % 3600000) / 60000)
        const seconds = 0
        return {years,months,days,hours,minutes,seconds}
    }
    function yearsMonthsDaysHoursMinutesSecondsInMs(timing: Timing){
        //convert timing to ms
        const ms = timing.years * 31536000000 + timing.months * 2592000000 + timing.days * 86400000 + timing.hours * 3600000 + timing.minutes * 60000 + timing.seconds * 1000
        return ms
    }

    const [timingInfo, setTimingInfo] = useState(msInYearsMonthsDaysHoursMinutesSeconds(ownerConfig?.sessionLength?ownerConfig.sessionLength:0))

    function TimingConfigurationInput(){
        //ask years, months, days, hours, minutes, seconds
        return(
            <Center>
            <Box
                className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
                m="2%"
            >
                <Center>
                <Box
                    m="2%"
                >
                <FormLabel
                    m="2%"
                    fontSize={"sm"}
                >
                    Session Length
                </FormLabel>
               <HStack>
                    <VStack>
                        <Text>Years</Text>
                        <NumberInput
                            value={timingInfo.years}
                            onChange={(e) => setTimingInfo({...timingInfo,years:parseInt(e)})}
                            min={0}
                            max={100}
                            w={"70px"}
                            fontSize={"sm"}
                            size={"sm"}
                        >
                            <NumberInputField
                                w={"70px"}
                                fontSize={"sm"}
                                textColor="black"
                                backgroundColor={"white"}
                            />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </VStack>
                    <VStack>
                        <Text>Months</Text>
                        <NumberInput
                            value={timingInfo.months}
                            onChange={(e) => setTimingInfo({...timingInfo,months:parseInt(e)})}
                            min={0}
                            max={11}
                            w={"60px"}
                            fontSize={"sm"}
                            size={"sm"}
                            
                        >
                            <NumberInputField
                                w={"60px"}
                                fontSize={"sm"}
                                textColor="black"
                                backgroundColor={"white"}
                            />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </VStack>
                    <VStack>
                        <Text>Days</Text>
                        <NumberInput
                            value={timingInfo.days}
                            onChange={(e) => setTimingInfo({...timingInfo,days:parseInt(e)})}
                            min={0}
                            max={30}
                            w={"60px"}
                            fontSize={"sm"}
                            size={"sm"}
                            
                        >
                            <NumberInputField
                                w={"60px"}
                                fontSize={"sm"}
                                textColor="black"
                                backgroundColor={"white"}
                            />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </VStack>
                    <VStack>
                        <Text>Hours</Text>
                        <NumberInput
                            value={timingInfo.hours}
                            onChange={(e) => setTimingInfo({...timingInfo,hours:parseInt(e)})}
                            min={0}
                            max={23}
                            w={"60px"}
                            fontSize={"sm"}
                            size={"sm"}
                        >
                            <NumberInputField
                                w={"60px"}
                                fontSize={"sm"}
                                textColor="black"
                                backgroundColor={"white"}
                            />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </VStack>
                    <VStack>
                        <Text>Minutes</Text>
                        <NumberInput
                            value={timingInfo.minutes}
                            onChange={(e) => setTimingInfo({...timingInfo,minutes:parseInt(e)})}
                            min={0}
                            max={59}
                            w={"55px"}
                            fontSize={"sm"}
                            size={"sm"}
                        >
                            <NumberInputField
                                w={"55px"}
                                fontSize={"sm"}
                                textColor="black"
                                backgroundColor={"white"}
                            />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </VStack>
                </HStack>
                </Box>
                </Center>
            </Box>
            </Center>
        )
    }

    useEffect(() => {
        getOwnerConfig()
    }, [])
    useEffect(() => {
        if (!isOwner) {
            setNavigateTo(Path.Admin)
        }
    }, [])
    useEffect(() => {
        //convert timingInfo to ms
        if(ownerConfig){
            const ms = yearsMonthsDaysHoursMinutesSecondsInMs(timingInfo)
            setOwnerConfig({...ownerConfig,sessionLength:ms})
        }
    }, [timingInfo])
    useEffect(() => {
        if(ownerConfig){
            setTimingInfo(msInYearsMonthsDaysHoursMinutesSeconds(ownerConfig.sessionLength))
        }
    }, [ownerConfig])

return (
        <>
            <Heading>
                Database Type : {ownerConfig?.databaseType?ownerConfig.databaseType:""}
            </Heading>
            <Box
                borderRadius={"md"}
                m={"2%"} 
                className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
            >
                    <Box
                        m={"2%"}
                    >


           
                        <FormLabel>
                            Owner ID
                        </FormLabel>
                        <HStack>
                            <Input
                                type={inputs.ownerID?"text":"password"}
                                value={ownerConfig?.ownerId?ownerConfig.ownerId:""}
                                onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,ownerId:e.target.value})}
                                backgroundColor={"ghostwhite"}
                                mr="2%"
                            />
                            <Button
                                onClick={() => {setInputs({...inputs,ownerID:!inputs.ownerID})}}
                            >
                                {inputs.ownerID?"Hide":"Show"}
                            </Button>
                        </HStack>
                    </Box>
                    <Box
                        m={"2%"}
                    >
                        <Checkbox
                            isChecked={(ownerConfig)?ownerConfig.useCustomUri:false}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,useCustomUri:e.target.checked})}
                            m="2%"
                        >
                            Use Custom URI
                        </Checkbox>
                        {(ownerConfig && ownerConfig.useCustomUri)?<>
                        <FormLabel>
                            Custom URI
                        </FormLabel>
                        <HStack>
                            <Input
                                type={inputs.dbURI?"text":"password"}
                                value={ownerConfig?.customUri?ownerConfig.customUri:""}
                                onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,customUri:e.target.value})}
                                backgroundColor={"ghostwhite"}
                                mr="2%"
                            />
                            <Button
                                onClick={() => {setInputs({...inputs,dbURI:!inputs.dbURI})}}
                                mr="2%"
                            >
                                {inputs.dbURI ?"Hide":"Show"}
                            </Button>
                        </HStack>
                        </>:<></>}
                        {(ownerConfig && !ownerConfig.useCustomUri)? <>
                    <Box
                        m={"2%"}
                    >
                        <FormLabel>
                            DB base URI
                        </FormLabel>
                        <Input
                            type="text"
                            value={ownerConfig?.urlDB?ownerConfig.urlDB:""}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,urlDB:e.target.value})}
                            backgroundColor={"ghostwhite"}
                            mr="2%"
                        />
                    </Box>
                    <Box
                        m={"2%"}
                    >
                        <FormLabel>                            
                            User for DB
                        </FormLabel>
                        <Input
                            type="text"
                            value={ownerConfig?.userDb?ownerConfig.userDb:""}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,userDb:e.target.value})}
                            backgroundColor={"ghostwhite"}
                            mr="2%"
                        />
                    </Box>
                    <Box
                        m={"2%"}
                    >
                        <FormLabel>
                            Password
                        </FormLabel>
                        <HStack>
                            <Input
                                type={inputs.passwordDb?"text":"password"}
                                value={ownerConfig?.passwordDb?ownerConfig.passwordDb:""}
                                onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,passwordDb:e.target.value})}
                                backgroundColor={"ghostwhite"}
                                mr="2%"
                            />
                            <Button
                                onClick={() => {setInputs({...inputs,passwordDb:!inputs.passwordDb})}}
                                mr="2%"
                            >
                                {inputs.passwordDb?"Hide":"Show"}
                            </Button>
                        </HStack>
                    </Box>
                    </>:<></>}
                    <Text>
                        DB configuration
                    </Text>
                </Box>
            </Box>
            <Box
                borderRadius={"md"}
                className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
            >
                <Box
                    m="2%"
                >
                    <FormLabel>
                        Email Address
                    </FormLabel>
                    <Input
                        type="text"
                        value={ownerConfig?.email?ownerConfig.email:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,email:e.target.value})}
                        backgroundColor={"ghostwhite"}
                        mr="2%"
                    />
                </Box>
                <Box
                    m="2%"
                >
                    <FormLabel>
                        Identity
                    </FormLabel>
                    <Input
                        type="text"
                        value={ownerConfig?.emailIdentity?ownerConfig.emailIdentity:""}
                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,emailIdentity:e.target.value})}
                        backgroundColor={"ghostwhite"}
                        mr="2%"
                    />
                </Box>
                <Box>
                    <HStack >
                        <Box
                            m="2%"
                        >
                            <HStack>
                                <VStack>
                                    <FormLabel>
                                        Server
                                    </FormLabel>
                                    <Input
                                        type="text"
                                        value={ownerConfig?.emailServer?ownerConfig.emailServer:""}
                                        onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,emailServer:e.target.value})}
                                        backgroundColor={"ghostwhite"}
                                        mr="2%"
                                    />
                                </VStack>
                                <VStack>
                                    <FormLabel>
                                        Port
                                    </FormLabel>
                                    <NumberInput
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
                    </HStack>
                </Box>
                <Box
                    m="2%"
                >
                    <FormLabel>
                        Email Password
                    </FormLabel>
                    <HStack>
                        <Input
                            type={inputs.passwordEmail?"text":"password"}
                            value={ownerConfig?.password?ownerConfig.password:""}
                            onChange={(e) => setOwnerConfig({...ownerConfig?ownerConfig:defaultOwnerConfig,password:e.target.value})}
                            backgroundColor={"ghostwhite"}
                            mr="2%"
                        />
                        <Button
                            onClick={() => {setInputs({...inputs,passwordEmail:!inputs.passwordEmail})}}
                            mr="2%"
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
                            m="2%"
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
                            m="2%"
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
                            isDisabled={ownerConfig?.activateAuto}
                            mr="2%"
                        />
                    </VStack>
                    <Spacer/>
                </HStack>
                <Text>
                    SMTP configuration
                </Text>
            </Box>
            <Box>
                <TimingConfigurationInput/>
            </Box>
            <Button
                onClick={() => {
                    sendConfiguration()
                    setNavigateTo(Path.Admin)
                    }
                }
            >
                Apply
            </Button>
            <Button
                onClick={() => setNavigateTo(Path.Admin)}
                m="2%"
            >
                Cancel
            </Button>
        </>
    )
}
export default Owner