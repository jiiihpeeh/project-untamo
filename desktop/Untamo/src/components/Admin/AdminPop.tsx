import {  Popover, Button, Portal, PopoverContent, PopoverHeader,
          PopoverArrow, PopoverBody, Center, PopoverAnchor, Box } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAdmin, usePopups, useSettings } from '../../stores'
import React, { useState, useEffect } from 'react'

function AdminPop() {
    const windowSize = usePopups((state) => state.windowSize)
    const navBarTop = useSettings((state) => state.navBarTop)
    const navHeight = useSettings((state) => state.height)
    const setAdminTime = useAdmin((state) => state.setTime)
    const setAdminToken = useAdmin((state) => state.setToken)
    const showAdminPop = usePopups((state) => state.showAdminPop)
    const setShowAdminPop = usePopups((state) => state.setShowAdminPop)

    const navigationTriggered = usePopups((state) => state.navigationTriggered)
    const [posStyle, setPosStyle] = useState<React.CSSProperties>({})

    const navigate = useNavigate()

    useEffect(() => {
        let elem = document.getElementById("link-admin")
        let navBar = document.getElementById("NavBar")
        if (elem && navBar) {
            let coords = elem.getBoundingClientRect()
            setPosStyle({ left: coords.left + coords.width / 2, top: (navBarTop) ? navHeight : windowSize.height - navHeight, position: "fixed" })
        }
    }, [navigationTriggered])
    return (
        <Popover
            isOpen={showAdminPop}
            onClose={() => setShowAdminPop(false)}
        >
            <PopoverAnchor>
                <Box style={posStyle} />
            </PopoverAnchor>
            <Portal>
                <PopoverContent>
                    <PopoverArrow />
                    <PopoverHeader>
                        <Center>
                            Admin Info
                        </Center>
                    </PopoverHeader>
                    <PopoverBody>
                        <Center>
                            <Button
                                onClick={() => { setAdminToken(''); setAdminTime(0); setShowAdminPop(false) } }
                                //m="10px"
                                key="End-Admin"
                            >
                                End Admin Session
                            </Button>
                        </Center>
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    )
}

export default AdminPop