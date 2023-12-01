import { createStandaloneToast } from "@chakra-ui/react"
import { useServer, useSettings} from "../stores"
import useAlarms from "../stores/alarmStore"
import { NotificationType } from "../stores/settingsStore"
export enum Status {
    Success ="success", 
    Error = "error",
    Warning = "warning", 
    Info = "info"
}

export function notification(title: string, description: string, info: Status = Status.Success, duration = 2500, isClosable = true) {
    const notificationType = useSettings.getState().notificationType

    if (notificationType === NotificationType.None) {
        return
    }
    const serverAddress = useServer.getState().address
    //check if server uses https
    const isSecure = serverAddress.startsWith("https")
    if ([NotificationType.Both, NotificationType.Desktop].includes(notificationType)) {
        const serverAddress = useServer.getState().address
        //check if server uses https
        if ( serverAddress.startsWith("https")){
            if (!window.Notification) {
                console.log('Browser does not support notifications.');
            } else {
                // check if permission is already granted
                if (Notification.permission === 'granted') {
                    // show notification here
                } else {
                    // request permission from user
                    Notification.requestPermission().then(function(p) {
                       if(p === 'granted') {
                           const notify = new Notification( title, {
                            body: description,
                            icon: useAlarms.getState().logo, 
                        })
                        
                       } else {
                           console.log('User blocked notifications.')
                       }
                    }).catch(function(err) {
                        console.error(err);
                    })
                }
            }           

        }
    }
    if ( !isSecure  || [NotificationType.Both, NotificationType.Toast].includes(notificationType)){
        const { toast } = createStandaloneToast()
        const navBarTop = useSettings.getState().navBarTop
        toast({
            title: title,
            description: description,
            status: info,
            duration: duration,
            isClosable: isClosable,
            position: (navBarTop) ? "bottom" : "top",
        })
    }

}