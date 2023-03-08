import { Toggle, Icon, Div, Text } from "react-native-magnus"
import React from "react"
import useAlarm from "./alarmStates"

const Active = () =>{
    const active = useAlarm((state)=> state.active)
    const setActive = useAlarm((state)=> state.setActive)

    return(
            <Div alignItems="center" mb={10} mt={10}>
                <Div row>
                <Text mr={3}>Active</Text>
                <Toggle
                    on={active}
                    onPress={() => setActive(!active)}
                    bg="gray200"
                    circleBg="blue500"
                    activeBg="blue700"
                    h={30}
                    w={60}
                />
            </Div>
            </Div>)
}

export default Active