
import React, { useState } from "react"
import { SafeAreaView, StatusBar, FlatList } from "react-native"
import { Div, Button, Icon, Modal, ThemeProvider, Text } from "react-native-magnus"
import useAlarms from "../../stores/alarmStore"
import usePopups from "../../stores/popUpStore"


const DeleteAlarm = () => {
    const deleteAlarm = useAlarms((state)=>state.deleteAlarm)
    const setShowDeleteAlarm = usePopups((state)=> state.setShowDeleteAlarm)
    const showDeleteAlarm = usePopups((state)=> state.showDeleteAlarm)
    const setToDelete = useAlarms((state)=> state.setToDelete)
    const setShowAlarmSelector = usePopups((state)=>state.setShowAlarmSelector)


    const deleteAlarmID = async() => {
        deleteAlarm()
        setShowDeleteAlarm(false)
        setToDelete("")
        setShowAlarmSelector(false)
    }
    
    return(
            <Div >
                <Modal 
                  isVisible={showDeleteAlarm}>
                  <Div>
                    <Text 
                      textAlign="center" 
                      fontSize="6xl" 
                      mt={100}
                    >
                      Are you sure?
                    </Text>
                  <Div 
                    row 
                    mt={150}
                  >
                      <Button 
                          flex={1} 
                          m={50} 
                          bg="red" 
                          onPress={() => deleteAlarmID()}
                      >
                          Yes
                        </Button>
                        <Button 
                          flex={1} 
                          m={50} 
                          onPress={() => {setShowDeleteAlarm(false)}} 
                        >
                          Cancel
                        </Button>
                    </Div>
                  </Div>
                </Modal>
            </Div>
          )
}


export default DeleteAlarm

