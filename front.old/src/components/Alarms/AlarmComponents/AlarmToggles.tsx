import { Flex, Spacer } from "../../ui"
import React from "react"
import AlarmActive from "./AlarmActive"
import AlarmTask from "./AlarmTask"

function AlarmToggles() {
    return (
        <Flex
            onMouseDown={e => e.preventDefault()}
        >
            <Spacer />
            <AlarmActive />
            <AlarmTask />
        </Flex>
    )
}
export default AlarmToggles