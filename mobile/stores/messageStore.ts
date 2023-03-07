import { create } from 'zustand'

export enum Status{
    Info = 0,
    Success = 1,
    Error = 2
}
type UseMessage = {
    message: string,
    setMessage: (message: string) => void,
    duration: number,
    setDuration: (duration: number) => void,
    iconName: string,
    setIconName: (icon: string) =>void,
    color: string,
    setColor: (color: string) => void,
    fontSize: string|number,
    setFontSize: (fontSize: string) => void,
    fontFamily: string,
    setFontFamily: (fontFamily: string) => void,
    background: string,
    setBackground: (background: string) => void,
    snackColor: string,
    setSnackColor: (color:string)=>void,
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
        setMessage: (message) => {
            set(
                {
                    message: message
                }
            )
        },
        duration: -1,
        setDuration: (duration) => {
            set(
                {
                    duration: duration
                }
            )
        },
        iconName: "checkcircle",
        setIconName: (icon) =>{
            set(
                {
                    iconName: icon
                }
            )
        },
        color: "white",
        setColor: (color: string) => {
            set(
                {
                    color: color
                }
            )
        },
        fontSize: "md",
        setFontSize: (fontSize) => {
            set(
                {
                    fontSize: fontSize
                }
            )
        },
        fontFamily: "AntDesign",
        setFontFamily: (fontFamily) => {
            set(
                {
                    fontFamily: fontFamily
                }
            )
        },
        background:"green700",
        setBackground:(color)  =>{
            set(
                {
                    color: color
                }
            )
        },
        snackColor: "white",
        setSnackColor: (color)=>{
            set(
                {
                    snackColor: color
                }
            )
        },
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
                    color: color
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
