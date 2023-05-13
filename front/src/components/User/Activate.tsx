import React, { useEffect, useState } from 'react'
import { Text,Button, RadioGroup, Radio, HStack,  VStack, Heading, Input, FormLabel, VisuallyHidden, Image  } from '@chakra-ui/react'
import { useLogIn } from "../../stores"
function Activate() {
    const captcha = useLogIn((state) => state.captcha)
    const fetchCaptcha = useLogIn((state) => state.fetchCaptcha)
    const activate = useLogIn((state) => state.activate)
    const [ accept, setAccept ] = useState(false)
    const [ captchaText, setCaptchaText ] = useState("")
    const [ verificationCode, setVerificationCode ] = useState("")
    const [ password, setPassword ] = useState("")

    useEffect(() => {
        if (!captcha){
            fetchCaptcha()
        }
    }, [])
    return (<>
                <Heading
                    m={"20px"}
                >
                    Activate
                </Heading>
                <form>
                    <FormLabel>
                        Enter Activation Code
                    </FormLabel>    
                    <Input
                        type={"text"}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    >
                    </Input>
                    <VisuallyHidden> 
                        <FormLabel>
                            Confirm Password
                        </FormLabel>
                        <Input
                            type={"password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        >
                        </Input>
                        <FormLabel>
                            Do you accept the terms and conditions?*
                        </FormLabel>
                        <RadioGroup
                            defaultValue='no'
                            onChange={(e) => {
                                if (e == 'yes') {
                                    setAccept(true)
                                } else {
                                    setAccept(false)
                                }
                            }}
                        >
                            <HStack>
                                <Radio
                                    value='no'
                                >
                                    No
                                </Radio>
                                <Radio
                                    value='yes'
                                >
                                    Yes
                                </Radio>
                            </HStack>
                        </RadioGroup>
                        <VStack>
                            {/* check if image is not null */}
                            <Image src={captcha?.src} alt={"captcha"} />
                            <FormLabel>
                                Enter Captcha
                            </FormLabel>
                            <Input
                                type={"text"}
                                value={captchaText}
                                onChange={(e) => setCaptchaText(e.target.value)}
                            >
                            </Input>
                        </VStack>
                        <Text>
                            *to use a fridge vending service.
                        </Text>
                    </VisuallyHidden>
                    <Button
                        m={"10px"}
                        onClick={() => {
                            activate(verificationCode, captchaText, accept)
                        }}
                    >
                        Activate
                    </Button>
                </form>
        </>
  )
}

export default Activate