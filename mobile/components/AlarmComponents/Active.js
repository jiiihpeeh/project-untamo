import { Toggle, Icon, Div, Text } from "react-native-magnus";
import React, { useContext } from "react";
import { AlarmComponentsContext } from "./AlarmComponentsContext";
const Active = (props) =>{
    const { active, setActive} = useContext(AlarmComponentsContext);

    return(
            <Div row ml={150} mt={20}>
                <Text mr={10}>Active</Text>
                <Toggle
                    on={active}
                    onPress={() => setActive(!active)}
                    bg="gray200"
                    circleBg="blue500"
                    activeBg="blue700"
                    h={30}
                    w={60}
                />
            </Div>)
}

export default Active;