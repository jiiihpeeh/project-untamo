import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCommunicationInfo } from '../stores'
import { notification, Status } from '../components/notification'
import axios from 'axios'
import { SessionStatus, FormData, UserInfo, Device, Alarm, Path } from '../type'
import { useServer, useDevices, useAdmin, useTimeouts,
         useFetchQR, useAlarms , validSession } from '../stores'
import { initAudioDB, deleteAudioDB ,fetchAudioFiles } from "./audioDatabase"
import { sleep } from '../utils'
import { postOfflineAlarms } from './alarmStore'

type UseLogIn = {
    wsToken: string,
    token : string,
    signedIn: number,
    sessionValid: SessionStatus,
    user: UserInfo,
    expire: number,
    tokenTime: number,
    tunes: Array<string>,
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
    getWsToken: () => string,
    fetchWsToken: () => Promise<string | null>,
    updateState: () => void,
    navigateTo: Path|null,
    setNavigateTo: (path: Path|null) => void,
}

async function userInfoFetch() {
    const { server, token } = getCommunicationInfo()
    if (token.length < 3) {
        return
    }
    try {
        let res = await axios.get(`${server}/api/user`,
            {
                headers: {
                    token: token
                }
            }
        )
        let userData = res.data as UserInfo
        useLogIn.setState({ user: userData })
    } catch (err) {
    }
}

async function refreshToken() {
    const { server, token } = getCommunicationInfo()
    const sessionStatus = useLogIn.getState().sessionValid
    const tokenTime = useLogIn.getState().tokenTime
    if ((Date.now() - tokenTime) < 7200000) {
        const randomTime = Math.ceil(Math.random() * 10000000)
        setTimeout(refreshToken, tokenTime + randomTime)
        return
    }
    if (sessionStatus !== SessionStatus.Valid) {
        return
    }
    try {
        let res = await axios.get(`${server}/api/refresh-token`,
            {
                headers: {
                    token: token
                }
            }
        )
        interface Resp {
            token: string
            time: number
        }
        let resp: Resp = res.data
        useLogIn.setState(
            {
                token: resp.token,
                expire: resp.time,
                tokenTime: Date.now()
            }
        )
        const randomTime = Math.ceil(Math.random() * 7200000)
        setTimeout(refreshToken, 2 * 24 * 60 * 60 * 1000 + randomTime)
    } catch (err) {
        (validSession()) ? notification("Session", "Failed to update token.", Status.Error) : {}
    }
}

async function checkSession() {
    const { server, token } = getCommunicationInfo()
    let status: SessionStatus
    if (token.length > 3) {
        try {
            let res = await axios.get(`${server}/api/is-session-valid`, {
                headers: {
                    token: token,
                }
            })
            //useAlarms.getState().fetchAlarms()
            //useLogIn.getState().getUserInfo()
            //useDevices.getState().fetchDevices()
            useLogIn.getState().updateState()
            notification("Session", "Continuing session.", Status.Info)
            setTimeout(refreshToken, 30000)
            status = SessionStatus.Valid
            
        } catch (err: any) {
            if (err.response.status === 403) {
                notification("Session", "Session invalid.", Status.Error)
                status = SessionStatus.NotValid
            } else {
                notification("Session", "Can not contact server.", Status.Warning)
                status = SessionStatus.NotValid
            }
        }
    } else {
        status = SessionStatus.NotValid
    }
    await sleep(1)
    console.log(status)
    return status
} 
async function editUserInfo(formData: FormData, changePassword: boolean) {
    const user = useLogIn.getState().user
    const { server, token } = getCommunicationInfo()
    let reqFormData: Partial<FormData> = Object.assign({}, formData)
    delete reqFormData.confirmPassword
    if (!changePassword) {
        delete reqFormData.changePassword
    }
    try {
        const res = await axios.put(
            `${server}/api/edit-user/` + formData.email,
            reqFormData,
            {
                headers: {
                    token: token
                }
            }
        )
        //console.log(res.data)
        notification("Edit Profile", "User information modified")
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
    } catch (err: any) {
        //console.error(err.response.data.message)
        notification("Edit Profile", `Profile save failed: ${err.response.data.message}`, Status.Error)
    }
} 

async function logIn(email: string, password: string) {
    useLogIn.setState({ sessionValid: SessionStatus.Validating })

    try {
        const server = useServer.getState().address
        let res = await axios.post(`${server}/login`,
            {
                email: email,
                password: password
            }
        )
        interface Resp {
            wsToken: string
            token: string
            screenName: string
            firstName: string
            lastName: string
            admin: boolean
            email: string
            time: number
            owner: boolean
        }
        let resp: Resp = res.data
        await initAudioDB()
        let now = Date.now()
        useLogIn.setState(
            {
                user: {
                    firstName: resp.firstName,
                    lastName: resp.lastName,
                    email: resp.email,
                    screenName: resp.screenName,
                    admin: resp.admin,
                    owner: resp.owner
                },
                sessionValid: SessionStatus.Valid,
                token: resp.token,
                wsToken: resp.wsToken,
                expire: resp.time,
                signedIn: now,
                tokenTime: now
            }
        )
        fetchAudioFiles()
        //useDevices.getState().fetchDevices()
        //useAlarms.getState().fetchAlarms()
        const randomTime = Math.ceil(Math.random() * 7200000)
        setTimeout(refreshToken, 2 * 24 * 60 * 60 * 1000 + randomTime)
        useLogIn.getState().updateState()
        notification("Logged In", "Successfully logged in")
        useLogIn.setState({ sessionValid: SessionStatus.Valid })
    } catch (err: any) {
        notification("Log In", "Log In Failed", Status.Error)
        useLogIn.setState({ sessionValid: SessionStatus.NotValid })
        //console.error(err)
    }
}

async function updateState(){
    const { server, token } = getCommunicationInfo()
    if (token.length < 3) {
        return
    }
    try {
        let res = await axios.get(`${server}/api/update`,
            {
                headers: {
                    token: token
                }
            }
        )
        interface Update {
            user: UserInfo
            alarms: Array<Alarm>
            devices: Array<Device>
        }
        let userData = res.data as Update
        useLogIn.setState({ user: userData.user })
        useAlarms.setState({ alarms: [...userData.alarms] })
        useDevices.setState({ devices: [...userData.devices] })
    } catch (err) {
        notification("Update", "Update failed", Status.Error)
    }
}

async function logOutProcedure() {
    const { server, token } = getCommunicationInfo()
    try {
        let res = await axios.post(`${server}/logout`,
            {
                msg: "smell you later"
            },
            {
                headers: {
                    token: token
                }
            }
        )
    } catch (err: any) {
        notification("Logged out", "Failed to clear user info", Status.Error)
        console.error("Clearing userinfo failed")
    }
    notification("Logged out", "Logged out", Status.Info)
    useFetchQR.getState().setFetchQR(false)
    useDevices.getState().clear()
    useAdmin.getState().clear()
    useTimeouts.getState().clear()
    useAlarms.getState().clear()
    await deleteAudioDB()

    useLogIn.setState(
        {
            user: {
                email: '',
                screenName: '',
                firstName: '',
                lastName: '',
                admin: false,
                owner: false
            },
            sessionValid: SessionStatus.NotValid,
            signedIn: -1,
            expire: -1,
            tokenTime: -1,
            token: '',
            wsToken: '',
        }
    )
    //localStorage.clear()
    sessionStorage.clear()
}

async function fetchWsToken() {
    const { server, token } = getCommunicationInfo()
    if(token.length < 3){
        return null
    }
    try {
        let res = await axios.get(`${server}/api/ws-token`, 
                                    {
                                        headers: 
                                                {
                                                    token: token
                                                }
                                    }
                                )
        interface WSToken {
            wsToken: string
        }
        let keyJson =  res.data as WSToken 
        //console.log(keyJson.wsToken)                      
        useLogIn.setState({wsToken: keyJson.wsToken})
        return keyJson.wsToken
    }catch(err:any){
        //console.log(err)
        return null    
    }
}

const emptyUser = {email: '', screenName:'', firstName:'', lastName:'', admin: false, owner: false}
const useLogIn = create<UseLogIn>()(
    persist(
      (set,get) => (
          {
            wsToken: '',
            token: '',
            signedIn: -1,
            sessionValid: SessionStatus.Unknown,
            user:  emptyUser,
            expire: -1,
            tokenTime: -1,
            tunes: [],
            fingerprint: [...Array(Math.round(Math.random() * 5 ) + 9)].map(() => Math.floor(Math.random() * 36).toString(36)).join('') + Date.now().toString(36),
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
                set(
                    {
                        sessionValid: SessionStatus.Validating,
                    }
                )
                let status = await checkSession()
                set (
                        {
                            sessionValid: status,
                        }
                )
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
            getWsToken: () => {
                return get().wsToken
            },
            fetchWsToken: async() => {
                let wsToken = await fetchWsToken()
                if(wsToken){
                    set({wsToken: wsToken})
                    return wsToken
                }
                return null
            },
            updateState: async () => {
                await postOfflineAlarms()
                await updateState()
            },
            navigateTo: null,
            setNavigateTo: (path) => {
                                        set(
                                                {
                                                    navigateTo: path
                                                }
                                            )
            }
        }
      ),
      {
          name: 'logIn', 
          storage: createJSONStorage(() => localStorage), 
          partialize: (state) => (
              { 
                wsToken: state.wsToken,
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
