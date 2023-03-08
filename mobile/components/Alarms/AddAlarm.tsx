import { Fab, Button, Div, Text } from "react-native-magnus"
import React from 'react'
import Icon from "react-native-vector-icons/EvilIcons"
import useAlarm, { DialogMode } from "./AlarmComponents/alarmStates"
import AlarmSelector from "./AlarmComponents/AlarmSelector"
import { AlarmCases } from "../../type"
import { usePopups } from "../../stores"
const AddAlarm = () => {	
    const onAddOpen = useAlarm((state)=> state.onAddOpen)
    const setOccurence = useAlarm((state)=> state.setOccurence)
    const setDialogMode = useAlarm((state)=> state.setDialogMode)
    const setShowAlarmSelector = usePopups((state)=>state.setShowAlarmSelector)
    const setShowDeleteAlarm = usePopups((state)=>state.setShowDeleteAlarm)

    const launchDialog = (occurence:AlarmCases) => {
        onAddOpen()
        setOccurence(occurence)
        setShowAlarmSelector(true)
        setShowDeleteAlarm(false)
        setDialogMode(DialogMode.Add)
    }
    function capitalizeFirstLetter(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const FabButtons = () => {
        const cases = Object.values(AlarmCases).filter((item) => item)
        return cases.map(alarmCase =>   {
                                            return(
                                                    <Button 
                                                        p="none" 
                                                        bg="transparent" 
                                                        justifyContent="flex-end" 
                                                        mb={20}
                                                        key={alarmCase}
                                                        onPress={() => launchDialog(alarmCase)}
                                                    >
                                                        <Div 
                                                            rounded="sm" 
                                                            bg="white" 
                                                            p="sm"
                                                        >
                                                            <Text 
                                                                fontSize="xl"
                                                            >
                                                                {capitalizeFirstLetter(alarmCase)}
                                                            </Text>
                                                        </Div>
                                                        <Icon
                                                            name="clock"
                                                            color="blue600"
                                                            h={100}
                                                            w={100}
                                                            rounded="circle"
                                                            ml="md"
                                                            bg="white"
                                                        />
                                                    </Button>
                                            )
                                        }
                        )
    }
    return(<>
        <Fab 
            bg="blue600" 
            h={65} 
            w={65}
        >
            {FabButtons()}
        </Fab>
        <AlarmSelector/>
        </>
    )
}

export default AddAlarm