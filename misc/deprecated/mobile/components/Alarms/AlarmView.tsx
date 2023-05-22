import React from 'react'
import Welcome from './../Welcome'
import Alarms from './Alarms'
import useDevices  from '../../stores/deviceStore'
import { StatusBar, SafeAreaView  } from 'react-native'
import UserWatcher from '../User/UserWatcher'

const AlarmView = () => {
    const currentDevice = useDevices((state)=>state.currentDevice)

    return( <>
                <StatusBar/>
                <SafeAreaView 
                    style=  {
                                { 
                                    flex: 1 
                                }
                            }
                >
                    {(currentDevice && currentDevice.length >0)?<Alarms/>:<Welcome/>}
                    <UserWatcher/>
                </SafeAreaView>
            </>
            )
}

export default AlarmView