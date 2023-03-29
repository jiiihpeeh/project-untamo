import { createStandaloneToast } from "@chakra-ui/react"
import { useSettings } from "../stores"
export enum Status {
    Success ="success", 
    Error = "error",
    Warning = "warning", 
    Info = "info"
}

export const notification = (title: string, description: string, info: Status = Status.Success, duration=2500, isClosable=true ) => {
    const { toast } = createStandaloneToast()
    const navBarTop = useSettings.getState().navBarTop
    toast({
        title: title,
        description: description,
        status: info,
        duration: duration,
        isClosable: isClosable,
        position: (navBarTop)?"bottom":"top",
    })
}