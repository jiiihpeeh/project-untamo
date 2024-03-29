import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCommunicationInfo, useSettings } from '../stores'
import { notification, Status } from '../components/notification'
import { SessionStatus, FormData, UserInfo, QrLoginScan } from '../type'
import useServer from './serverStore'
import useDevices, { uniqueDevices } from './deviceStore'
import useAdmin from './adminStore'
import useTimeouts from './timeoutsStore'
import useFetchQR from './QRStore'
import useAlarms, { uniqueAlarms, postOfflineAlarms } from './alarmStore'
import { initAudioDB, deleteAudioDB ,fetchAudioFiles } from "./audioDatabase"
import { sleep, isSuccess, generateRandomString, calculateSHA512 } from '../utils'
import { Body, getClient, ResponseType } from "@tauri-apps/api/http"
import { Alarm, Device, Path, PasswordReset } from "../type"
import { UserColors, defaultCardDark, defaultCardLight, defaultWebColors } from './settingsStore'

type UseLogIn = {
    wsToken: string
    token : string,
    signedIn: number,
    sessionValid: SessionStatus,
    user: UserInfo,
    expire: number,
    tokenTime: number,
    tunes: Array<string>,
    wsPair: string,
    fingerprint: string,
    captcha: HTMLImageElement|null,
    captchaSum: string,
    navigateTo: null | Path,
    setToken : (input:string) => void,
    setSignedIn: (t:number) => void,
    setSessionValid: (s: SessionStatus) => void,
    editUser: (form:FormData, changePassword: boolean) => void,
    setExpire: (t: number) => void,
    validateSession : () => void,
    getUserInfo: () => void,
    logIn:(user:string, password: string) => void,
    logInWithQr: (scan: QrLoginScan) => void,
    logOut: () => void,
    refreshToKen:()=>void,
    getWsToken: () => string,
    fetchWsToken: () => void,
    updateState: () => void,
    setNavigateTo: (path: Path | null) => void,
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
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/api/user`,
                method: 'GET',
                headers: {
                    token: token
                },
                responseType: ResponseType.JSON
            }
        )
        isSuccess(res)
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
        //captchaResp = "Q7HJ"
        let captchaElement = useLogIn.getState().captcha
        if(captchaElement){
            let captchaSum = useLogIn.getState().captchaSum
            //take 4 chars from captcha
            captchaResp = captchaSum.substring(5,9)
        }
    }
    try {
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/api/activate-account`,
                method: 'POST',
                headers: {
                    token: token
                },
                responseType: ResponseType.JSON,
                body: Body.json({
                    verification: verification,
                    captcha: captchaResp,
                    accepted: !accepted,
                })
            }
        )
        isSuccess(res)
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


async function fetchWsToken() {
    const { server, token } = getCommunicationInfo()
    if(token.length < 3){
        return null
    }
    try {
        const client = await getClient()
        const res = await client.request(
                                            {
                                                url: `${server}/api/ws-token`,
                                                method: 'GET',
                                                headers: {
                                                    token: token
                                                },
                                                responseType: ResponseType.JSON
                                            }
                                        )
        isSuccess(res)

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
		const client = await getClient()
		
        //use fetch blob
        let res = await client.request(
                                        {
                                            url: `${server}/api/activation-captcha`,
                                            method: 'GET',
                                            headers: {
                                                token: token
                                            },
                                            responseType: ResponseType.Binary
                                        }
        )
        isSuccess(res)
        //convert res.data uint8array to blob
        
        //resp data as png image
        let arr = new Uint8Array(res.data as Uint8Array)
        let captchaBlob = new Blob([arr], {type: 'image/png'})
        
        let captchaSum = await calculateSHA512(captchaBlob)
        useLogIn.setState({captchaSum: captchaSum})
        let captcha = URL.createObjectURL(captchaBlob)
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
        //setTimeout(refreshToken,tokenTime + randomTime)
        return
    }
    if (sessionStatus !== SessionStatus.Valid) {
        return
    }
    try {
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/api/refresh-token`,
                method: 'GET',
                headers: {
                    token: token
                },
                responseType: ResponseType.JSON,
                body: Body.json({
                    token: token
                })
            }
        )

        interface Resp {
            token: string
            time: number
            wsToken: string
            wsPair: string
        }
        isSuccess(res)
        let resp: Resp = res.data as Resp
        useLogIn.setState(
            {
                token: resp.token,
                expire: resp.time,
                tokenTime: Date.now(),
                wsToken: resp.wsToken,
                wsPair: resp.wsPair
            }
        )
        const randomTime = Math.ceil(Math.random() * 7200000)
        const refreshTimeOutID = setTimeout(refreshToken,2*24*60*60*1000 + randomTime)
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
    await sleep(30)
    const { server, token } = getCommunicationInfo()
    let status: SessionStatus
    if (token.length > 3) {
        try {
            const client = await getClient()
            const res = await client.request(
                {
                    url: `${server}/api/is-session-valid`,
                    method: 'GET',
                    headers: {
                        token: token
                    },
                    responseType: ResponseType.JSON
                }
            )
            isSuccess(res)
            if (res && res.status === 200) {
                useLogIn.getState().updateState()
                notification("Session", "Continuing session.", Status.Info)
                //setTimeout(refreshToken, 30000)
                status = SessionStatus.Valid
            } else {
                status = SessionStatus.Unknown
            }
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
        status = SessionStatus.NotValid
    }
    await sleep(1)
    return status
} 
async function editUserInfo(formData: FormData, changePassword: boolean) {
    const user = useLogIn.getState().user
    const { server, token } = getCommunicationInfo()
    let reqFormData: Partial<FormData> = Object.assign({}, formData)
    delete reqFormData.confirm_password
    if (!changePassword) {
        delete reqFormData.change_password
    }
    try {
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/api/edit-user/` + formData.email,
                method: 'PUT',
                headers: {
                    token: token
                },
                responseType: ResponseType.JSON,
                body: Body.json(reqFormData)
            }
        )
        isSuccess(res)
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


async function updateState(){
    const { server, token } = getCommunicationInfo()
    if (token.length < 3) {
        return
    }
   // console.log("Updating state")
    //check if session
    const sessionStatus = useLogIn.getState().sessionValid
    if (sessionStatus === SessionStatus.Activate) {
        return
    }
    //console.log("can Update state ")
    try {
        const client = await getClient()
        const res = await client.request(
                                            {
                                                url: `${server}/api/update`,
                                                method: 'GET',
                                                headers: {
                                                    token: token
                                                },
                                                responseType: ResponseType.JSON
                                            }
                                        )   
        isSuccess(res)
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
    await getWebColors()
}
async function logIn(email: string, password: string) {
    //console.log("Logging in ", email, password)
    useLogIn.setState(
                        { 
                            sessionValid: SessionStatus.Validating 
                        }
                    )

    try {
        const server = useServer.getState().address
        const client = await getClient()
        const res = await client.request(
                                            {
                                                url: `${server}/login`,
                                                method: 'POST',
                                                responseType: ResponseType.JSON,
                                                body: Body.json({
                                                    email: email,
                                                    password: password
                                                }),
                                            }
                                        )

        interface Resp {
            token: string
            screenName: string
            firstName: string
            lastName: string
            admin: boolean
            email: string
            time: number
            owner: boolean
            wsToken: string
            wsPair: string,
            active: boolean
        }
        isSuccess(res)
        let resp: Resp = res.data as Resp
        //console.log(resp)
        
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
        
        useLogIn.setState({ sessionValid: SessionStatus.Valid })
        await initAudioDB()
        fetchAudioFiles()
        await sleep(20)
        useLogIn.getState().updateState()
        useLogIn.getState().setNavigateTo(Path.Welcome)
    } catch (err: any) {
        //console.log(err)
        notification("Log In", "Log In Failed", Status.Error)
        useLogIn.setState({ sessionValid: SessionStatus.NotValid })
        //console.error(err)
    }
    await getWebColors()
}
async function logOutProcedure() {
    const { server, token } = getCommunicationInfo()
    try {
        const client = await getClient()
        let res = await client.request(
            {
                url: `${server}/logout`,
                method: 'POST',
                responseType: ResponseType.JSON,
                headers: {
                    token: token
                },
                body: Body.json({
                    msg: "smell you later"
                })
            }
        )
        isSuccess(res)
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
            wsToken: ''
        }
    )
    //localStorage.clear()
    sessionStorage.clear()
}

async function forgotPassword(email: string) {
    const { server, token } = getCommunicationInfo()
    try {
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/forgot-password/${email}`,
                method: 'PUT',
                responseType: ResponseType.JSON,
            }
        )
        isSuccess(res)
        notification("Reset Password", "Reset code for password was sent to email address")
    } catch (err) {
        notification("Reset Password", "Password reset failed", Status.Error)
    }
}

async function resetPassword(reset: PasswordReset) {
    const { server, token } = getCommunicationInfo()
    try {
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/reset-password`,
                method: 'POST',
                responseType: ResponseType.JSON,
                body: Body.json(reset)
            }
        )
        isSuccess(res)
        notification("Reset Password", "Password reset was successful")
        useLogIn.getState().setNavigateTo(Path.LogIn)
    } catch (err : any) {
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
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/resend-activation/${email}`,
                method: 'PUT',
                responseType: ResponseType.JSON,
            }
        )
        isSuccess(res)
        notification("Resend Activation", "Activation code was sent to email address")
    } catch (err) {
        notification("Resend Activation", "Activation resend failed", Status.Error)
    }
}

async function getWebColors(){
    const {server, token} = getCommunicationInfo()


    try{
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/api/web-colors`,
                method: 'GET',
                headers: {
                    token: token
                },
                responseType: ResponseType.JSON
            }
        )
        isSuccess(res)
        const newColors : UserColors = defaultWebColors()
        const cols = res.data as UserColors
        //console.log(cols, {...newColors, ...cols})
        useSettings.setState({webColors: {...newColors, ...cols}})
    }catch(err){
        notification('Web Colors', 'Failed to get web colors', Status.Error)
    }
}

async function logInWithQr(scan: QrLoginScan) {
    let server = scan.server
    let token = scan.token
    //set server
    useServer.getState().setAddress(server)
    try{
        const client = await getClient()
        const res = await client.request(
            {
                url: `${server}/qr-login`,
                method: 'POST',
                responseType: ResponseType.JSON,
                body: Body.json({qrToken: token})
            }
        )
        isSuccess(res)
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
        let resp: Resp = res.data as Resp
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
    await getWebColors()
}


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
            token: '',
            wsToken: '',
            signedIn: -1,
            sessionValid: SessionStatus.Unknown,
            user:  emptyUser,
            expire: -1,
            tokenTime: -1,
            tunes: [],
            wsPair:"",
            fingerprint:  generateRandomString(24) + Date.now().toString(36),//[...Array(Math.round(Math.random() * 5 ) + 9)].map(() => Math.floor(Math.random() * 36).toString(36)).join('') + Date.now().toString(36),
            captcha: null,
            captchaSum: "",
            navigateTo: null,
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
                        sessionValid: SessionStatus.Validating
                    }
                )
                let status = await checkSession()
                set ({
                    sessionValid: status
                })
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
            fetchWsToken: async () => {
                await fetchWsToken()
            },
            updateState: async () => {
                await postOfflineAlarms()
                await updateState()
            },
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
            logInWithQr: async (scan) => {
                await logInWithQr(scan)
            },
        }
      ),
      {
          name: 'logIn', 
          storage: createJSONStorage(() => localStorage), 
          partialize: (state) => (
              { 
                token: state.token,
                wsToken: state.wsToken,
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

export default useLogIn
