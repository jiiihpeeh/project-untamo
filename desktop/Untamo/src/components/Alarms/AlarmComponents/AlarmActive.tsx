import { Center, FormLabel, Switch} from "@chakra-ui/react"
import React from "react";
import useAlarm from "./alarmStates"

const AlarmActive = () => {
    const setActive = useAlarm((state)=>state.setActive)
    const active = useAlarm((state)=>state.active)
    return(
            <Center>
                <FormLabel>
                    Active
                    <Switch
                        m={"1%"}
                        isChecked={active}
                        onChange={()=>setActive(!active)}
                        size={"lg"}
                    />
                </FormLabel>
            </Center>
    )
}
export default AlarmActive