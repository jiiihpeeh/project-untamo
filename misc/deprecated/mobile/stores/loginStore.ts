import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import { SessionStatus, FormData} from '../type'
import { UserInfo } from '../type'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Status } from './messageStore'
//import { initAudioDB, deleteAudioDB ,fetchAudioFiles } from "../audiostorage/audioDatabase"
import useMessage from './messageStore'
import useAlarms from './alarmStore'
import useDevices from './deviceStore'
import useServer from './serverStore'
import useTimeouts from './timeouts'
import useFetchQR from './QRStore'
import useAudio from './audioStore'

const getCommunicationInfo = () => {
    const server = useServer.getState().address
    const token = useLogIn.getState().token
    return { 
                server: server,
                token: token
           }
}
type UseLogIn = {
    token : string,
    signedIn: number,
    sessionValid: SessionStatus,
    user: UserInfo,
    expire: number,
    tokenTime: number,
    tones: Array<string>,
    fingerprint: string,
    setToken : (input:string) => void,
    setSignedIn: (t:number) => void,
    setSessionValid: (s: SessionStatus) => void,
    editUser: (form:FormData, changePassword: boolean) => void,
    setExpire: (t: number) => void,
    validateSession : () => void,
    getUserInfo: () => void,
    logIn:(user:string, password: string) => void,
    logOut: () => void,
    refreshToKen:()=>void,
}

const notification = useMessage.getState().notification

const userInfoFetch = async () =>{
    const {server, token} = getCommunicationInfo()
    try {
        let res = await axios.get(`${server}/api/user`,  
                                    {
                                        headers: 
                                                {
                                                    token: token
                                                }
                                    }
                                )
        let userData = res.data as UserInfo
        useLogIn.setState({ user: userData})
    }catch(err){
    }
}

const refreshToken = async () =>{
    const { server, token } = getCommunicationInfo()
    const sessionStatus = useLogIn.getState().sessionValid
    const tokenTime = useLogIn.getState().tokenTime
    if((Date.now() - tokenTime) < 7200000){
        const randomTime = Math.ceil(Math.random()*10000000)
        setTimeout(refreshToken,tokenTime + randomTime)
        return
    }
    if( sessionStatus !== SessionStatus.Valid){
        return
    }
    try {
        let res = await axios.post(`${server}/api/refreshToken`,  
                                    {
                                        token: token
                                    },
                                    {
                                        headers: 
                                                {
                                                    token: token
                                                }
                                    }
                                )
        interface Resp{
            token: string,
            time: number
        }
        let resp: Resp = res.data 
        useLogIn.setState  (
                                { 
                                    token: resp.token, 
                                    expire: resp.time,
                                    tokenTime: Date.now()
                                }
                            )
        const randomTime = Math.ceil(Math.random()*7200000)
        setTimeout(refreshToken,2*24*60*60*1000 + randomTime)
    }catch(err){
       // notification("Session", "Failed to update token.", Status.Error)
    }
}

const checkSession = async () => {
    const { server, token } = getCommunicationInfo()

    if (token.length > 3){
        try {
            let res = await axios.get(`${server}/api/is-session-valid`,  {
                headers: 
                    {
                        token: token
                    }
            })
            if(res.data.status){
                useAlarms.getState().fetchAlarms()
                useLogIn.getState().getUserInfo()
                useDevices.getState().fetchDevices()
               // notification("Session", "Continuing session.", Status.Info)
               notification( "Continuing session",5000, Status.Info)

                setTimeout(refreshToken,30000)
                useLogIn.setState
                                ( 
                                    { 
                                        sessionValid: SessionStatus.Valid  
                                    }
                                )
            } else {
                useLogIn.setState
                                ( 
                                    { 
                                        sessionValid: SessionStatus.NotValid  
                                    }
                                )
            }
        } catch(err: any){
            if(err.response.status === 403){
                //notification("Session", "Session invalid.", Status.Error)
                useLogIn.setState
                                ( 
                                    { 
                                        sessionValid: SessionStatus.NotValid  
                                    }
                                )
            }else{
               // notification("Session", "Can not contact server.", Status.Warning)
                useLogIn.setState
                                ( 
                                    { 
                                        sessionValid: SessionStatus.Unknown  
                                    }
                                )
            }
        }
    } else {
        useLogIn.setState( 
                            { 
                                sessionValid: SessionStatus.NotValid  
                            }
                        )
    }
} 

const editUserInfo = async(formData: FormData, changePassword: boolean) =>{
    const user = useLogIn.getState().user
    const { server, token } = getCommunicationInfo()
    let reqFormData : Partial<FormData> = Object.assign({}, formData)
    delete reqFormData.confirm_password
    if(!changePassword){
        delete reqFormData.change_password
    }
    try {
        const res = await axios.put(
                                    `${server}/api/editUser/`+formData.email,
                                        reqFormData ,
                                            {
                                                headers:
                                                            { 
                                                                token: token 
                                                            }
                                            }
                                )
        //console.log(res.data)
        notification( "User information modified",5000, Status.Info)
        useLogIn.setState(
            {
                user: {
                        email: formData.email,
                        screenName: formData.screenName,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        admin: user.admin,
                        owner: user.owner
                      }
            }
        )
    } catch (err:any){
        //console.error(err.response.data.message)
        notification(`Profile save failed: ${err.response.data.message}`, 5000, Status.Error)
    }
} 

const logIn = async(email: string, password: string) => {
    try{
        const server = useServer.getState().address
        let res = await axios.post(`${server}/login`, 
                                        {
                                            email:email, 
                                            password:password
                                        }
                                    )
        interface Resp{
            token: string,
            screenName: string,
            firstName: string,
            lastName: string,
            admin: boolean,
            email: string,
            time: number,
            owner: boolean
        }
        console.log(res)
        let resp : Resp = res.data
        
        //await initAudioDB()
        let now = Date.now()
        useLogIn.setState(
                            {
                                user: 
                                        {
                                            firstName: resp.firstName,
                                            lastName: resp.lastName,
                                            email: resp.email,
                                            screenName: resp.screenName,
                                            admin: resp.admin,
                                            owner: resp.owner
                                        },
                                sessionValid: SessionStatus.Valid,
                                token: resp.token,
                                expire: resp.time,
                                signedIn: now,
                                tokenTime:now
                            }
                        )
        //fetchAudioFiles()
        useAudio.getState().fetchTracks()
        useDevices.getState().fetchDevices()
        useAlarms.getState().fetchAlarms()
        const randomTime = Math.ceil(Math.random()*7200000)
        setTimeout(refreshToken,2*24*60*60*1000+randomTime)
        notification("Successfully logged in",3500, Status.Success)
        useMessage.setState({ message: "Successfully logged in"})
    }catch(err:any){
        console.log(err)
        notification("Log In Failed", 4500,  Status.Error)
    }
}
const logOutProcedure = async () => {
    const { server, token } = getCommunicationInfo()
    try {
        let res = await axios.post(`${server}/logout`, 
                                        {
                                            msg: "smell you later"
                                        }, 
                                        {
                                            headers: 
                                                    {
                                                        token: token
                                                    }
                                        }
                                    )
    }catch(err:any){
        notification("Failed to clear user info",5700, Status.Error)
    }
    notification( "Logged out", 5000,Status.Info)
    useFetchQR.getState().setFetchQR(false)
    useDevices.getState().clear()
    useTimeouts.getState().clear()
    //await deleteAudioDB()

    useLogIn.setState(
                        {
                            user: 
                                {
                                    email: '',
                                    screenName: '',
                                    firstName: '',
                                    lastName: '',
                                    admin: false,
                                    owner: false
                                },
                            sessionValid: SessionStatus.NotValid,
                            signedIn:-1,
                            expire:-1,
                            tokenTime:-1,
                            token: '',
                        }
                    )
    //localStorage.clear()
    //sessionStorage.clear()
}
const emptyUser = {email: '', screenName:'', firstName:'', lastName:'', admin: false, owner: false}
const useLogIn = create<UseLogIn>()(
    persist(
      (set) => (
          {
            token: '',
            signedIn: -1,
            sessionValid: SessionStatus.Unknown,
            user:  emptyUser,
            expire: -1,
            tokenTime: -1,
            tones: [],
            fingerprint:[...Array(Math.round(Math.random() * 5 ) + 9)].map(() => Math.floor(Math.random() * 36).toString(36)).join('') + Date.now().toString(36),
            setToken: (s) => set(
                  { 
                    token : s
                  }
            ),
            setSignedIn: (t) => set(
                {
                    signedIn: t
                }
            ),
            setSessionValid: (s) => set(
                {
                    sessionValid: s
                }
            ),
            editUser: async (form, changePassword) => {
               await editUserInfo( form, changePassword)
            },
            setExpire: ( n) => set(
                {
                    expire: n
                }
            ),
            validateSession: async () =>{
                 await checkSession()

            },
            getUserInfo: async () => {
                await userInfoFetch()
            },
            logIn: async(email, password) =>{
                await logIn(email, password)
            },
            logOut: async() => {
                    logOutProcedure()
            },
            refreshToKen: async()=>{
                await refreshToken()
            },   
        }
      ),
      {
          name: 'logIn', 
          storage: createJSONStorage(() => AsyncStorage), 
          partialize: (state) => (
              { 
                token: state.token,
                signedIn: state.signedIn,
                user: state.user,
                expire: state.expire,
                tokenTime: state.tokenTime
              }
          ),
      }
    )
)

export default useLogIn
