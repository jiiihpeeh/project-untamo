import { create } from 'zustand'

export enum Status{
    Info = 0,
    Success = 1,
    Error = 2
}
type UseMessage = {
    message: string,
    duration: number,
    iconName: string,
    color: string,
    fontSize: string|number,
    fontFamily: string,
    background: string,
    snackColor: string,
    notification: (message: string, duration: number, status: Status )=> void,
    reset: () => void
}
/* snackbarRef.current.show(
    "Here is a light snack for you!",
    {
      duration: 2000,
      suffix: <Icon
        name="checkcircle"
        color="white"
        fontSize="md"
        fontFamily="AntDesign"
      />
 */
const defaultMessage =  {
                            message: "",
                            duration: 2000,
                            iconName: "checkcircle",
                            color:"white",
                            fontsize: "md",
                            fontFamily: "AntDesign",
                            snackColor: "white",
                            background: "green700"
                        }
const useMessage = create<UseMessage>((set) => ({
        message: "",
        duration: -1,
        iconName: "checkcircle",
        color: "white",
        fontSize: "md",
        fontFamily: "AntDesign",
        background:"green700",
        snackColor: "white",
        notification: (message, duration, status )=> {
            let color: string
            switch(status){
                case Status.Success:
                    color = "blue"
                    break
                case Status.Info:
                    color = "green"
                    break
                case Status.Error:
                    color = "red"
                    break
            }
            set(
                {
                    message: message,
                    duration: duration,
                    color: color,
                    background: color
                }
                
            )
        },

        reset:() => {
            set(
                {...defaultMessage}
            )
        }
    }
))

export default useMessage
