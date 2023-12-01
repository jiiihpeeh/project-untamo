import { createStandaloneToast } from "@chakra-ui/react"
import { useSettings } from "../stores"
//import tauri's notification api
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification'
import { NotificationType } from "../stores/settingsStore"

export enum Status {
    Success ="success", 
    Error = "error",
    Warning = "warning", 
    Info = "info"
}

export async function notification(title: string, description: string, info: Status = Status.Success, duration = 2500, isClosable = true) {
    const notificationType = useSettings.getState().notificationType
    if (notificationType === NotificationType.None) {
        return
    }
    if ([NotificationType.Both, NotificationType.Desktop].includes(notificationType)) {
        //check if permission is granted
        if ( await isPermissionGranted() === true) {
            sendNotification({title: title, body: description})
        } else {
            //if not, request permission
            let perm = await requestPermission()
            if (perm !== "granted") {
                sendNotification({title: title, body: description})
            }
        }
    }
    if ([NotificationType.Both, NotificationType.Toast].includes(notificationType)) {
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