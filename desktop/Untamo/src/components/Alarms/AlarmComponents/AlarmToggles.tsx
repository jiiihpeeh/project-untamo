import { Flex, Spacer } from "@chakra-ui/react"
import React from "react"
import AlarmActive from "./AlarmActive"
import AlarmTask from "./AlarmTask"

const AlarmToggles = () => {
    return(
            <Flex>
                <Spacer/>
                <AlarmActive/>
                <AlarmTask/>
            </Flex>
    )
}
export default AlarmToggles