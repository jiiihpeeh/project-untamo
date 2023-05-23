
import React, { useState, useEffect } from 'react'
import { useLogIn, usePopups, useSettings } from './stores'
import { ColorMode, PasswordReset, Path } from './type'
import { Box, FormControl, FormLabel, Input, Button, Divider } from '@chakra-ui/react'
function ResetPassword(){
    const [formData, setFormData] = useState<PasswordReset>({
        email: "",
        password: "",
        confirmPassword: "",
        passwordResetToken: ""
    })
    const windowSize = usePopups((state) => state.windowSize)
    const colorMode = useSettings((state) => state.colorMode)
    const isMobile = usePopups((state) => state.isMobile)
    const resetPassword = useLogIn((state) => state.resetPassword)
    const [canSubmit, setCanSubmit] = useState(false)
    const emailPattern = new RegExp(".+@.+..+")
    const setNavigateTo = useLogIn((state) => state.setNavigateTo)

    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFormData((formData) => {
            return {
                ...formData,
                [event.target.name]: event.target.value
            }
        })
    }
    useEffect(() => {
        function isOK() {
            if (formData.password.length > 5 && formData.password === formData.confirmPassword && formData.passwordResetToken.length > 5 && emailPattern.test(formData.email)) {
                setCanSubmit(true)
            } else {
                setCanSubmit(false)
            }
        }
        isOK()
    }, [formData])

    return(
            <form>
                <Box
                    className={(colorMode === ColorMode.Light) ? 'UserForm' : "UserFormDark"}
                    width={(isMobile) ? windowSize.width * 0.90 : Math.min(500, windowSize.width * 0.90)}
                    mt="35%"
                >
                    <FormControl
                        onSubmit={(e)=>{e.preventDefault()}}
                        width="95%"
                        margin="0 auto"
                        mt="15%"
                    >
                        <FormLabel
                            htmlFor="email"
                            className="FormLabel"
                            mt="1%"
                            mb="1%"
                        >
                            Email
                        </FormLabel>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            onChange={(e) => onChange(e)}
                            value={formData.email}
                            bgColor="GhostWhite"
                            className="Register" />
                        <FormLabel
                            htmlFor='password'
                            className="FormLabel"
                        >
                            Password
                        </FormLabel>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            onChange={(e) => onChange(e)}
                            value={formData.password}
                            bgColor="GhostWhite"
                            className="Register" />
                        <Divider />
                        <FormLabel>
                            Confirm Password
                        </FormLabel>
                        <Input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            onChange={(e) => onChange(e)}
                            value={formData.confirmPassword}
                            bgColor="GhostWhite"
                            className="Register" />
                        <Divider />
                        <FormLabel>
                            Password Reset Token
                        </FormLabel>
                        <Input
                            type="password"
                            name="passwordResetToken"
                            id="passwordResetToken"
                            onChange={(e) => onChange(e)}
                            value={formData.passwordResetToken}
                            bgColor="GhostWhite"
                            className="Register" />
                        <Divider />
                        <Button
                            onClick={() => resetPassword(formData)}
                            mt="1%"
                            mb="1%"
                            colorScheme={(colorMode === ColorMode.Dark) ? "blue" : "gray"}
                            isDisabled={!canSubmit}
                        >
                            Reset Password
                        </Button>
                        <Box>
                            <Button
                                colorScheme={(colorMode === ColorMode.Dark) ? "blue" : "gray"}
                                onClick={() => setNavigateTo(Path.LogIn)}
                                mb="1%"
                            >
                                Back to LogIn
                            </Button>
                        </Box>
                    </FormControl>
                </Box>
            </form>
    )
}

export default ResetPassword