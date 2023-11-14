import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCommunicationInfo } from '../stores'
import { notification, Status } from '../components/notification'
import axios from 'axios'
import useServer from '../stores/serverStore'
import useDevices, { uniqueDevices } from '../stores/deviceStore'
import useAlarms,{ postOfflineAlarms, uniqueAlarms }  from '../stores/alarmStore'
import useTimeouts from '../stores/timeoutsStore'
import useAdmin from '../stores/adminStore'
import useFetchQR from '../stores/QRStore'
import { SessionStatus, FormData, UserInfo, Device, Alarm, Path, PasswordReset, QrLoginScan } from '../type'
import { initAudioDB, deleteAudioDB ,fetchAudioFiles } from "./audioDatabase"
import { sleep, generateRandomString, calculateSHA512 } from '../utils'


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
    navigateTo: Path|null,
    wsPair: string,
    captcha: HTMLImageElement|null,
    captchaSum: string,
    setToken : (input:string) => void,
    setSignedIn: (t:number) => void,
    setSessionValid: (s: SessionStatus) => void,
    editUser: (form:FormData, changePassword: boolean) => void,
    setExpire: (t: number) => void,
    validateSession : () => void,
    getUserInfo: () => void,
    logIn:(user:string, password: string) => void,
    logInWithQr : (scan: QrLoginScan) => void,
    logOut: () => void,
    refreshToKen:()=>void,
    getWsToken: () => string,
    fetchWsToken: () => Promise<string | null>,
    updateState: () => void,
    setNavigateTo: (path: Path|null) => void,
    fetchCaptcha: () => void,
    activate: (verification: string, captcha: string, accepted: boolean ) => void,
    forgotPassword: (email: string) => void,
    resetPassword: (reset: PasswordReset) => void,
    resendActivation: (email: string) => void,
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
function validSession() {
    return useLogIn.getState().sessionValid === SessionStatus.Valid
}

async function activate(verification: string, captcha: string, accepted: boolean ) {
    const { server, token } = getCommunicationInfo()
    if (token.length < 3) {
        return
    }
    let captchaResp = captcha
    if (captchaResp === ""){
        let captchaElement = useLogIn.getState().captcha
        if(captchaElement){
            let captchaSum = useLogIn.getState().captchaSum
            captchaResp = captchaSum.substring(5,9)
        }
    }

    try {
        let res = await axios.post(`${server}/api/activate-account`,
            {
                verification: verification,
                captcha: captchaResp,
                accepted: !accepted,
            },
            {
                headers: {
                    token: token
                }
            }
        )
        let user = useLogIn.getState().user
        user.active = true
        useLogIn.setState({ user: user })
        notification("Activate", "Account activated", Status.Info)
        //set session valid
        useLogIn.setState({ sessionValid: SessionStatus.Valid })
        //fetch update
        await sleep(20)
        await initAudioDB()
        fetchAudioFiles()
        useLogIn.getState().updateState()
    } catch (err) {
        notification("Activate", "Account activation failed", Status.Error)
    }
}

async function fetchCaptcha(){
    await sleep(10)
    if(useLogIn.getState().sessionValid !== SessionStatus.Activate){
        return
    }
    const { server, token } = getCommunicationInfo()

    //revoke old captcha
    let imgUrl  =  useLogIn.getState().captcha
    if(imgUrl){
        URL.revokeObjectURL(imgUrl.src)
    } 
    try {
        //fetch captcha as png image
        //use axios to fetch blob
        let res = await axios.get(`${server}/api/activation-captcha`,
                                    {
                                        responseType: 'arraybuffer',
                                        headers: {
                                            token: token
                                        }
                                    }
                                )
                                
        //resp data as png image
        let responseBlob = new Blob([res.data], {type: 'image/png'})
        let captchaSum = await calculateSHA512(responseBlob)
        useLogIn.setState({captchaSum: captchaSum})
        let captcha = URL.createObjectURL(responseBlob)
        //convert Blob to Image
        let image = new Image()
        image.src = captcha
        useLogIn.setState({captcha: image})
    }catch(err){

    }
}


export async function refreshToken(checkTime :boolean = true) {
    const { server, token } = getCommunicationInfo()
    const sessionStatus = useLogIn.getState().sessionValid
    const tokenTime = useLogIn.getState().tokenTime
    if (checkTime && (Date.now() - tokenTime) < 7200000) {
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
            wsToken: string
            wsPair: string
        }
        let resp: Resp = res.data
        useLogIn.setState(
            {
                token: resp.token,
                expire: resp.time,
                tokenTime: Date.now(),
                wsToken : resp.wsToken,
                wsPair: resp.wsPair
            }
        )
        const randomTime = Math.ceil(Math.random() * 7200000)
        const refreshTimeOutID = setTimeout(refreshToken, 2 * 24 * 60 * 60 * 1000 + randomTime)
        useTimeouts.getState().setRefreshTokenTimeout(refreshTimeOutID)
        //check if updated session is valid
        await sleep(120)
        await checkSession()
        useServer.getState().wsActionDisconnect()
        useLogIn.getState().updateState()
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
            useLogIn.getState().updateState()
            notification("Session", "Continuing session.", Status.Info)
            status = SessionStatus.Valid
            
        } catch (err: any) {
            if (err.response.status === 401) {
                notification("Session", "Session invalid.", Status.Error)
                status = SessionStatus.NotValid
            } else {
                notification("Session", "Can not contact server.", Status.Warning)
                status = SessionStatus.Unknown
            }
        }
    } else {
        status = SessionStatus.Unknown
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
                    owner: user.owner,
                    active: user.active
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
            wsPair: string
            active: boolean
        }
        let resp: Resp = res.data
        let now = Date.now()
        useLogIn.setState(
            {
                user: {
                    firstName: resp.firstName,
                    lastName: resp.lastName,
                    email: resp.email,
                    screenName: resp.screenName,
                    admin: resp.admin,
                    owner: resp.owner,
                    active: resp.active
                },
                sessionValid: SessionStatus.Valid,
                token: resp.token,
                wsToken: resp.wsToken,
                expire: resp.time,
                signedIn: now,
                tokenTime: now,
                wsPair: resp.wsPair
            }
        )

        const randomTime = Math.ceil(Math.random() * 7200000)
        const refreshTimeOutID = setTimeout(refreshToken, 2 * 24 * 60 * 60 * 1000 + randomTime)
        useTimeouts.getState().setRefreshTokenTimeout(refreshTimeOutID)
        notification("Logged In", "Successfully logged in")
        if (resp.active === false) {
            useLogIn.setState({ sessionValid: SessionStatus.Activate })
            useLogIn.getState().setNavigateTo(Path.Activate)
            return
        }
        await sleep(20)
        useLogIn.getState().updateState()
        useLogIn.setState({ sessionValid: SessionStatus.Valid })
        await initAudioDB()
        fetchAudioFiles()
        useLogIn.getState().setNavigateTo(Path.Welcome)
    } catch (err: any) {
        notification("Log In", "Log In Failed", Status.Error)
        useLogIn.setState({ sessionValid: SessionStatus.NotValid })
        //console.error(err)
    }
}

async function updateState(){
    const { server, token } = getCommunicationInfo()
    if (token.length < 3 || useLogIn.getState().sessionValid === SessionStatus.Activate) {
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
        useAlarms.setState({ alarms: uniqueAlarms([...userData.alarms]) })
        let deviceOld = useDevices.getState().devices
        useDevices.setState({ devices: uniqueDevices([...userData.devices]) })
        //set all device viewable if deviceOld is empty
        if (deviceOld.length === 0) {
            //get userData.devices ids
            let deviceIds = userData.devices.map((device) => device.id)
            //set all devices to viewable
            useDevices.getState().setViewableDevices(deviceIds)
        }
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
                owner: false,
                active: false
            },
            sessionValid: SessionStatus.NotValid,
            signedIn: -1,
            expire: -1,
            tokenTime: -1,
            token: '',
            wsToken: '',
            wsPair: ''
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
        useLogIn.setState({wsToken: keyJson.wsToken})
        return keyJson.wsToken
    }catch(err:any){
        return null    
    }
}

async function forgotPassword(email: string) {
    const { server, token } = getCommunicationInfo()
    try {
        let res = await axios.put(`${server}/forgot-password/${email}`)
        notification("Reset Password", "Reset code for password was sent to email address")
    } catch (err) {
        notification("Reset Password", "Password reset failed", Status.Error)
    }
}

async function resetPassword(reset: PasswordReset) {
    const { server, token } = getCommunicationInfo()
    try {
        let res = await axios.post(`${server}/reset-password`,
            reset
        )
        notification("Reset Password", "Password reset successful")
        useLogIn.getState().setNavigateTo(Path.LogIn)
    }catch (err : any) {
        if (err.response && err.response.data) {
          let msg = err.response.data;
          notification("Reset Password", `Password reset failed: ${msg.message}`, Status.Error);
        } else {
          notification("Reset Password", "Password reset failed", Status.Error);
        }
    }
}

async function resendActivation(email: string){
    const { server, token } = getCommunicationInfo()
    try {
        let res = await axios.put(`${server}/resend-activation/${email}`)
        notification("Resend Activation", "Activation code was sent to email address")
    } catch (err) {
        notification("Resend Activation", "Activation resend failed", Status.Error)
    }
}

async function logInWithQr(scan: QrLoginScan) {
    let server = scan.server
    let token = scan.token
    useServer.getState().setAddress(server)
    try{
        let res = await axios.post(`${server}/qr-login`,
            { qrToken: token }
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
            wsPair: string
            active: boolean
        }
        let resp: Resp = res.data
        let now = Date.now()
        useLogIn.setState(
            {
                user: {
                    firstName: resp.firstName,
                    lastName: resp.lastName,
                    email: resp.email,
                    screenName: resp.screenName,
                    admin: resp.admin,
                    owner: resp.owner,
                    active: resp.active
                },
                sessionValid: SessionStatus.Valid,
                token: resp.token,
                wsToken: resp.wsToken,
                expire: resp.time,
                signedIn: now,
                tokenTime: now,
                wsPair: resp.wsPair
            }
        )
        const randomTime = Math.ceil(Math.random() * 7200000)
        const refreshTimeOutID = setTimeout(refreshToken, 2 * 24 * 60 * 60 * 1000 + randomTime)
        useTimeouts.getState().setRefreshTokenTimeout(refreshTimeOutID)
        notification("Logged In", "Successfully logged in")
        if (resp.active === false) {
            useLogIn.setState({ sessionValid: SessionStatus.Activate })
            useLogIn.getState().setNavigateTo(Path.Activate)
            return
        }
        await sleep(20)
        useLogIn.getState().updateState()
        useLogIn.setState({ sessionValid: SessionStatus.Valid })
        await initAudioDB()
        fetchAudioFiles()
        useLogIn.getState().setNavigateTo(Path.Welcome)
    } catch (err: any) {
        notification("Log In", "Log In Failed", Status.Error)
        useLogIn.setState({ sessionValid: SessionStatus.NotValid })
    }
}


//check session status if session is unknown
async function checkSessionStatus(){
    while ( true ){
        await sleep(600)
        const sessionStatus = useLogIn.getState().sessionValid
        if(sessionStatus === SessionStatus.Unknown){
            useLogIn.getState().validateSession()
        }
        await sleep(30000)
    } 
}

checkSessionStatus()

const emptyUser = {email: '', screenName:'', firstName:'', lastName:'', admin: false, owner: false, active: false}
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
            wsPair:"",
            fingerprint: generateRandomString(24) + Date.now().toString(36),//[...Array(Math.round(Math.random() * 5 ) + 9)].map(() => Math.floor(Math.random() * 36).toString(36)).join('') + Date.now().toString(36),
            captcha: null,
            captchaSum: "",
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
                await refreshToken(true)
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
            },
            fetchCaptcha: async () => {
                await fetchCaptcha()
            },
            activate: async (verification, captcha, accepted ) => {
                await activate(verification, captcha, accepted)

            },
            forgotPassword: async (email) => {
                await forgotPassword(email)
            },
            resetPassword: async (reset) => {
                await resetPassword(reset)
            },
            resendActivation: async (email: string) => {
                await resendActivation(email)
            },
            logInWithQr: async (qrCode) => {
               await logInWithQr(qrCode)
            },
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
                tokenTime: state.tokenTime,
                wsPair: state.wsPair,
              }
          ),
      }
    )
)

//pingServer using axios
export async function pingServer(server: string) {
    try {
      const res = await axios.get(`${server}/ping`)
      if (res.status === 200) {
        notification('Server Ping', 'Server is online', Status.Success
        )
      } else {
        notification('Server Ping', 'Server is not responding', Status.Error
        )
      }
    } catch (e) {
      notification('Server Ping', 'Server is not responding', Status.Error
      )
    }
 }
  


export default useLogIn
