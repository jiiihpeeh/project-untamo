//create dropdown menu for color schemes and insert delete button for each
import React, { useState, useEffect } from 'react'
import { usePopups, useSettings } from '../../stores'
import {  Button, IconButton,  Menu, MenuButton, MenuList, MenuItem, Table, Tr, Td, Tbody, Center, Spacer,  } from '@chakra-ui/react'
import { DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons'

interface Props {
    setter?: ((value: boolean) => void) | null
    setterValue?: boolean
}

function LoadColorScheme({ setter , setterValue }: Props) {
    const webColors = useSettings((state) => state.webColors)
    const setWebColors = useSettings((state) => state.setWebColors)
    const loadColorScheme = useSettings((state) => state.loadColorScheme)


    function deleteColorScheme(colorSchemeName: string) {
        const newWebColors = { ...webColors }
        delete newWebColors[colorSchemeName]
        setWebColors(newWebColors)
    }

    return (
        <Center>
            <Menu matchWidth={true}>
                <MenuButton 
                    as={Button} 
                    colorScheme="blue" 
                    rightIcon={<ChevronDownIcon/>} 
                >
                    Load Theme
                </MenuButton>
                <MenuList>
                    {Object.keys(webColors).map((colorSchemeName) => (
                        <MenuItem 
                            w="100%"
                            key={`col-${colorSchemeName}`}
                        >
                            <Table
                                size={"sm"}
                                variant="unstyled"
                                mb={"0px"}
                                mt={"0px"}
                            >
                                <Tbody>
                                    <Tr>
                                        <Td
                                            onClick={() => {
                                                loadColorScheme(colorSchemeName)
                                                if(setter && setterValue !== undefined ){
                                                    setter(setterValue)
                                                }
                                            }}
                                        >
                                            {colorSchemeName}
                                        </Td>
                                        <Td
                                            alignContent={"right"}
                                            mr={"0px"}
                                        >
                                            <Spacer />
                                            <Button
                                                onClick={() => deleteColorScheme(colorSchemeName)}
                                                colorScheme="red"
                                                isDisabled={["Light", "Dark"].includes(colorSchemeName)}
                                                size={"xs"}
                                                alignContent="right"
                                                mr={"0px"}
                                            >
                                                Delete
                                            </Button>
                                        </Td>                                
                                    </Tr>
                                </Tbody>
                            </Table>
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
        </Center>
    )
}

export default LoadColorScheme