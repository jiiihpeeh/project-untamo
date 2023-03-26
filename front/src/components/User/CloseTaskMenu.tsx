
import { Menu, MenuButton, MenuItem, MenuList, Button } from '@chakra-ui/react'
import React from 'react'
import { useSettings } from '../../stores'
import { CloseTask } from '../../type'
import {  capitalize } from '../../utils'

const CloseTaskMenu = () =>{
    const closeTask = useSettings((state) => state.closeTask)
    const setCloseTask = useSettings((state) => state.setCloseTask)
    const taskSubmission = Object.values(CloseTask).filter((item) => item)

    const taskMenu = () => {
        return taskSubmission.map(item => {
                                            return (
                                                    <MenuItem 
                                                        key={item} 
                                                        onClick={() => setCloseTask(item)}
                                                    >
                                                        {capitalize(item)}
                                                    </MenuItem>
                                                )
                                            }
                                    )
     }

    return (
            <Menu 
                matchWidth
            >
                <MenuButton 
                    as={Button}
                    width={"100%"}
                >
                    On Turn Off : {capitalize(closeTask)}
                </MenuButton>
                <MenuList
                    width={"100%"}
                >
                    {taskMenu()}
                </MenuList> 
            </Menu>
    )
}

export default CloseTaskMenu