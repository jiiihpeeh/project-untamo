import { useState } from "react"
import { Button, Icon, Div,Text, Input, Image, Modal, Dropdown } from 'react-native-magnus'
import { ScrollView, TouchableHighlight, View, SafeAreaView, StatusBar } from 'react-native'
import AlarmButton from "./AlarmButton"
import { timeForNextAlarm } from "./calcAlarmTime"
import AddAlarm from "./AddAlarm"
import EditAlarm from "./EditAlarm"
import EditDrawer from '../EditDrawer'
import PlayAlarm from "./PlayAlarm"
import AlarmWatcher from "./AlarmWatcher"
import { useAlarms, useDevices , usePopups} from "../../stores"
import useAlarm from "./AlarmComponents/alarmStates"
import { Alarm } from "../../type"
import { DialogMode } from "./AlarmComponents/alarmStates"

const Alarms = () => {
	const currentDevice  = useDevices((state)=> state.currentDevice)
	const alarms = useAlarms((state)=> state.alarms)
	const runAlarm = useAlarms((state)=> state.runAlarm)
	const alarmToEditDialog = useAlarm((state)=> state.alarmToEditDialog)

	const timeForNextLaunch = useAlarms((state)=> state.timeForNextLaunch)
    const [ playAlarm, setPlayAlarm ] = useState(false)
    const setShowAlarmSelector = usePopups((state)=>state.setShowAlarmSelector)
    const setDialogMode = useAlarm((state)=>state.setDialogMode)

    const [ viewAllDevices, setViewAllDevices ] = useState(false)
    const launchEdit = (alarm: Alarm) => {
        alarmToEditDialog(alarm) 
        setShowAlarmSelector(true)
        setDialogMode(DialogMode.Edit)
    }
    const renderAlarms = () => {
            let showAlarms = alarms         
            if(!viewAllDevices){
                showAlarms = showAlarms.filter(alarm => alarm.devices.includes(currentDevice))
            }

            let viewableAlarmsSet = new Set<Alarm>
            let timeAlarmMap = new Map <number, Set<string>>()
            for(const secondFiltrate of showAlarms){
                viewableAlarmsSet.add(secondFiltrate)
				let timeStamp : number| null
                try{
                    timeStamp = timeForNextAlarm(secondFiltrate).getTime()
                }catch(err){
                    timeStamp = null
                }			
                 
                if(timeStamp && secondFiltrate){
                    if(timeAlarmMap.has(timeStamp)){
                        timeAlarmMap.set(timeStamp, timeAlarmMap.get(timeStamp).add(secondFiltrate.id) )
                    }else{
                        timeAlarmMap.set(timeStamp, new Set( [ secondFiltrate.id ]))
                    }
                }
            }
            let viewableAlarms = [...viewableAlarmsSet]
		
            let timeMapArray = [...timeAlarmMap.keys()].sort(function(a, b){return a - b})
            let sortedView: Array<Alarm> = []
            for(const item of timeMapArray){
                for (const subitem of timeAlarmMap.get(item)){
                    let filtration = viewableAlarms.filter(alarm => alarm.id === subitem)[0]
                    if(filtration){
                        sortedView.push(filtration)
                    }
                }
            }
            return sortedView.map(alarm => 
                                            {
                                                return(
                                                    <AlarmButton 
                                                        alarm={alarm} 
                                                        key={`alarmButton-${alarm.id}`}
                                                        onPress={()=>{launchEdit(alarm)}}
                                                    />
                                                    )
                                            }
                                )

    }

    return(
        <>  
        <StatusBar 
            barStyle="dark-content" 
        />
        <SafeAreaView 
            style=  {
                        { 
                            flex: 1 
                        }
                    }
        >
        <Div 
            row 
            alignItems="center"
        >
                <Text 
                    fontSize={"xl"} 
                    color={viewAllDevices?"gray": "black"} 
                    flex={1} 
                    m={10} 
                    textAlign="center"
                    onPress={() => setViewAllDevices(false)}
                >
                      This device
                </Text>
                <Text 
                    fontSize={"xl"} 
                    color={viewAllDevices?"black": "gray"}
                    flex={1} m={10} 
                    textAlign="center"
                    onPress={() => setViewAllDevices(true)}
                >
                      All devices
                </Text>

        </Div>
        <ScrollView>
            {renderAlarms()}
        </ScrollView>
        <Div 
            alignItems="flex-end" 
            row
        >
            <EditAlarm/>
        </Div>
        <AddAlarm/>
       
        <EditDrawer/>
        {/* <Button onPress={() => setAlarmWindow(true)}> Alarm</Button> */}
        {/* <PlayAlarm/> */}
        {/* <AlarmWatcher/> */}
        </SafeAreaView>
        </>
    )
}

export default Alarms