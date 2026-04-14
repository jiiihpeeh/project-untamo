import { toast } from '../ui/Toast'
import { useServer, useSettings, useAlarms } from "../stores"
import { NotificationType } from "../stores/settingsStore"

export enum Status {
    Success = "success",
    Error   = "error",
    Warning = "warning",
    Info    = "info"
}

export function notification(title: string, description: string, info: Status = Status.Success, duration = 2500, isClosable = true) {
    const notificationType = useSettings.getState().notificationType
    if (notificationType === NotificationType.None) return

    const serverAddress = useServer.getState().address
    const isSecure = serverAddress.startsWith("https")

    if ([NotificationType.Both, NotificationType.Desktop].includes(notificationType) && isSecure) {
        if (!window.Notification) {
            console.log('Browser does not support notifications.')
        } else if (Notification.permission === 'granted') {
            new Notification(title, { body: description, icon: useAlarms.getState().logo })
        } else {
            Notification.requestPermission().then(p => {
                if (p === 'granted') new Notification(title, { body: description, icon: useAlarms.getState().logo })
            }).catch(console.error)
        }
    }

    if (!isSecure || [NotificationType.Both, NotificationType.Toast].includes(notificationType)) {
        toast({ type: info as 'success' | 'error' | 'warning' | 'info', title, description })
    }
}