import { create } from 'zustand'


type Popup = {
    showAlarmSelector : boolean,
    setShowAlarmSelector : (to: boolean) => void
    showEditAlarm: boolean,
    setShowEditAlarm: (to: boolean) => void,
    showAddAlarm: boolean,
    setShowAddAlarm: (to: boolean) => void,   
    showDeleteAlarm: boolean,
    setShowDeleteAlarm: (to: boolean) => void,
}


const usePopups = create<Popup>((set) => ({
        showAlarmSelector: false,
        setShowAlarmSelector: (to) => {
            set(
                {
                    showAlarmSelector: to
                }
            )
        },
        showAddAlarm: false,
        setShowAddAlarm: (to) =>{
            set(
                    {
                        showAddAlarm: to
                    }
                )
        },
        showEditAlarm: false,
        setShowEditAlarm: (to) => {
            set( 
                {
                    showEditAlarm: to
                }
            )
        },
        showDeleteAlarm: false,
        setShowDeleteAlarm: (to) => {
            set( 
                {
                    showDeleteAlarm: to
                }
            )
        },
    }
))

export default usePopups
