import { Center, FormLabel, Switch} from "@chakra-ui/react"
import React from "react";
import useAlarm from "./alarmStates"

const AlarmTask = () => {
    const setCloseTask = useAlarm((state)=>state.setCloseTask)
    const closeTask = useAlarm((state)=>state.closeTask)
    return(
            <Center>
                <FormLabel>
                    Closing Task
                    <Switch
                        m={"1%"}
                        isChecked={closeTask}
                        onChange={()=>setCloseTask(!closeTask)}
                        size={"lg"}
                    />
                </FormLabel>
            </Center>
    )
}
export default AlarmTask