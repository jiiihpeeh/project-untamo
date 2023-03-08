import React,{ useEffect }  from "react"
import AlarmOnce from "./AlarmOnce"
import AlarmWeekly from "./AlarmWeekly"
import AlarmDaily from "./AlarmDaily"
import AlarmYearly from "./AlarmYearly"
import AlarmCase from "./AlarmCase"
import { SafeAreaView, StatusBar , ScrollView} from "react-native"
import { Div, Button, Icon, Modal } from "react-native-magnus"
import useAlarm, { DialogMode } from "./alarmStates"
import { AlarmCases } from "../../../type"
import { usePopups, useAlarms } from "../../../stores"

const AlarmSelector = () => {
    const alarmCase = useAlarm((state)=> state.occurence)
    const alarmId = useAlarm((state)=> state.id)
    const showAlarmSelector = usePopups((state)=>state.showAlarmSelector)
    const setShowAlarmSelector = usePopups((state)=>state.setShowAlarmSelector)
    const showDeleteButton = useAlarm((state)=>state.showDeleteButton)
    const dialogMode = useAlarm((state)=>state.dialogMode)
    const setToDelete = useAlarms((state)=> state.setToDelete)
    const setShowDeleteAlarm = usePopups((state)=> state.setShowDeleteAlarm)
    const getAlarm = useAlarm((state)=> state.alarmFromDialog)
    const addNewAlarm = useAlarms((state)=> state.addNewAlarm)
    const editAlarm = useAlarms((state)=> state.editAlarm)


    const postAlarm = () => {
        const alarm = getAlarm()
        switch(dialogMode){
            case DialogMode.Add:
                addNewAlarm(alarm)
                break
            case DialogMode.Edit:
                editAlarm(alarm)
                break
        }
        setShowAlarmSelector(false)
    }

    useEffect(()=>{
        console.log("show selector",showAlarmSelector)
    },[showAlarmSelector])
    return(<>
        <StatusBar 
            barStyle="dark-content" 
        />
        <SafeAreaView 
            style={
                    { 
                        flex: 1 
                    }
                }
        >
        <Modal 
            isVisible={showAlarmSelector}
        >
        <ScrollView>
            <Button
                bg="gray400"
                h={35}
                w={35}
                position="absolute"
                top={20}
                right={15}
                rounded="circle"
                onPress={() =>  {
                                    setShowAlarmSelector(false)
                                }
                        }
            >
                <Icon 
                    color="black900" 
                    name="close" 
                />
            </Button>
            <Div >
                <AlarmCase/>
                {alarmCase === AlarmCases.Once && <AlarmOnce/>}
                {alarmCase === AlarmCases.Weekly && <AlarmWeekly/>}
                {alarmCase === AlarmCases.Daily && <AlarmDaily/>}
                {alarmCase === AlarmCases.Yearly && <AlarmYearly/>}
            </Div>
            <Div 
                alignItems="center"
            >
                <Div row >
                    <Button 
                        flex={1} 
                        m={20} 
                        onPress={() =>  {
                                            postAlarm()
                                        }
                                } 
                    >
                        OK
                    </Button>
                    <Button 
                        flex={1} 
                        m={20} 
                        onPress={() =>  {
                                            setShowAlarmSelector(false)
                                        } 
                                }
                    > 
                        Cancel
                    </Button>
                </Div>
                {showDeleteButton &&
                    <Div 
                        alignItems="center">
                        <Button 
                            m={20} 
                            bg="red" 
                            onPress={() => {    
                                                setToDelete(alarmId)
                                                setShowDeleteAlarm(true)
                                           }
                                    } 
                        > 
                            Delete
                        </Button>
                    </Div>} 
            </Div>
            </ScrollView>
        </Modal>
        </SafeAreaView>
    </>)
}

export default AlarmSelector
