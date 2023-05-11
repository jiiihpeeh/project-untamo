import { Menu, MenuButton, MenuItem, MenuList, Button } from '@chakra-ui/react'
import React from 'react'
import { useSettings } from '../../stores'
import { CloseTask } from '../../type'
import {  capitalize } from '../../utils'
import { dialogSizes as sizes } from '../../stores/settingsStore'
function CloseTaskMenu() {
    const closeTask = useSettings((state) => state.closeTask)
    const setCloseTask = useSettings((state) => state.setCloseTask)
    const size = useSettings((state) => state.dialogSize)
    const taskSubmission = Object.values(CloseTask).filter((item) => item)

    function taskMenu() {
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
            size={sizes.get(size)}
        >
            <MenuButton
                as={Button}
                width={"100%"}
                size={sizes.get(size)}
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