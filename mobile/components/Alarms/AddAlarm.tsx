import { Fab, Button, Div, Text } from "react-native-magnus";
import React, { useRef, useState, useContext, useEffect } from 'react';
import Icon from "react-native-vector-icons/EvilIcons";
import useAlarm, { DialogMode } from "./AlarmComponents/alarmStates";
import AlarmSelector from "./AlarmComponents/AlarmSelector";
import { AlarmCases } from "../../type";
import { usePopups } from "../../stores";
const AddAlarm = () => {	
    const onAddOpen = useAlarm((state)=> state.onAddOpen)
    const setOccurence = useAlarm((state)=> state.setOccurence)
    const setShowDeleteButton = useAlarm((state)=> state.setShowDeleteButton)
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
    return(<>
        <Fab 
            bg="blue600" 
            h={65} 
            w={65}
        >
            <Button 
                p="none" 
                bg="transparent" 
                justifyContent="flex-end" 
                mb={20}  
                onPress={() => launchDialog(AlarmCases.Once)}
            >
                <Div 
                    rounded="sm" 
                    bg="white" 
                    p="sm"
                >
                    <Text 
                        fontSize="xl"
                    >
                        Once
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
            <Button 
                p="none" 
                bg="transparent" 
                justifyContent="flex-end" 
                mb={20}
                onPress={() => launchDialog(AlarmCases.Weekly)}
            >
                <Div 
                    rounded="sm" 
                    bg="white" 
                    p="sm"
                >
                    <Text 
                        fontSize="xl"
                    >
                        Weekly
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
            <Button 
                p="none" 
                bg="transparent" 
                justifyContent="flex-end" 
                mb={20}
                onPress={() => launchDialog(AlarmCases.Daily)}
            >
                <Div 
                    rounded="sm" 
                    bg="white" 
                    p="sm"
                >
                    <Text 
                        fontSize="xl"
                    >
                        Daily
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
            <Button 
                p="none" 
                bg="transparent" 
                justifyContent="flex-end" 
                mb={20}
                onPress={() => launchDialog(AlarmCases.Yearly)}
            >
                <Div 
                    rounded="sm" 
                    bg="white" 
                    p="sm"
                >
                    <Text 
                        fontSize="xl"
                    >
                        Yearly
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
        </Fab>
        <AlarmSelector/>
        </>
    )
}

export default AddAlarm;