import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { getCommunicationInfo, apiGet, apiPost, apiPut, apiGetArrayBuffer, apiFetch, isApiError } from './api'
import { notification, Status } from '../components/notification'
import { SessionStatus, FormData, UserInfo, Device, Alarm, Path, PasswordReset, QrLoginScan } from '../type'
import { initAudioDB, deleteAudioDB, fetchAudioFiles } from './audioDatabase'
import { sleep, generateRandomString, calculateSHA512 } from '../utils'
import { defaultWebColors, UserColors } from './settingsStore'
import { uniqueDevices } from './deviceStore'
import { uniqueAlarms, postOfflineAlarms } from './alarmStore'
// circular import — safe: useStore only accessed inside function bodies after init
import { useStore } from './store'

const emptyUser: UserInfo = {
    email: '', screenName: '', firstName: '', lastName: '',
    admin: false, owner: false, active: false
}

async function getWebColors() {
    try {
        const cols = await apiGet<UserColors>('/api/web-colors')
        useStore.setState({ webColors: { ...defaultWebColors(), ...cols } })
    } catch {
        notification('Web Colors', 'Failed to get web colors', Status.Error)
    }
}

async function userInfoFetch() {
    const { token } = getCommunicationInfo()
    if (token.length < 3) return
    try {
        const userData = await apiGet<UserInfo>('/api/user')
        useStore.setState({ user: userData })
    } catch {}
}

async function activate(verification: string, captcha: string, accepted: boolean) {
    const { token } = getCommunicationInfo()
    if (token.length < 3) return
    let captchaResp = captcha
    if (captchaResp === "") {
        const captchaElement = useStore.getState().captcha
        if (captchaElement) {
            captchaResp = useStore.getState().captchaSum.substring(5, 9)
        }
    }
    try {
        await apiPost('/api/activate-account', { verification, captcha: captchaResp, accepted: !accepted })
        const user = { ...useStore.getState().user, active: true }
        useStore.setState({ user, sessionValid: SessionStatus.Valid })
        notification("Activate", "Account activated", Status.Info)
        await sleep(20)
        await initAudioDB()
        fetchAudioFiles()
        useStore.getState().updateState()
    } catch {
        notification("Activate", "Account activation failed", Status.Error)
    }
}

async function fetchCaptcha() {
    await sleep(10)
    if (useStore.getState().sessionValid !== SessionStatus.Activate) return
    const imgUrl = useStore.getState().captcha
    if (imgUrl) URL.revokeObjectURL(imgUrl.src)
    try {
        const buf          = await apiGetArrayBuffer('/api/activation-captcha')
        const responseBlob = new Blob([buf], { type: 'image/png' })
        const captchaSum   = await calculateSHA512(responseBlob)
        useStore.setState({ captchaSum })
        const captcha = URL.createObjectURL(responseBlob)
        const image   = new Image()
        image.src     = captcha
        useStore.setState({ captcha: image })
    } catch {}
}

export async function refreshToken(checkTime: boolean = true) {
    const { token }     = getCommunicationInfo()
    const sessionStatus = useStore.getState().sessionValid
    const tokenTime     = useStore.getState().tokenTime
    if (checkTime && (Date.now() - tokenTime) < 7200000) {
        const randomTime = Math.ceil(Math.random() * 10000000)
        setTimeout(refreshToken, tokenTime + randomTime)
        return
    }
    if (sessionStatus !== SessionStatus.Valid) return
    try {
        interface Resp { token: string; time: number; wsToken: string; wsPair: string }
        const resp = await apiGet<Resp>('/api/refresh-token')
        useStore.setState({
            token:     resp.token,
            expire:    resp.time,
            tokenTime: Date.now(),
            wsToken:   resp.wsToken,
            wsPair:    resp.wsPair,
        })
        const randomTime       = Math.ceil(Math.random() * 7200000)
        const refreshTimeOutID = setTimeout(refreshToken, 2 * 24 * 60 * 60 * 1000 + randomTime)
        useStore.getState().setRefreshTokenTimeout(refreshTimeOutID)
        await sleep(120)
        await checkSession()
        useStore.getState().wsActionDisconnect()
        useStore.getState().updateState()
    } catch {
        if (useStore.getState().sessionValid === SessionStatus.Valid) {
            notification("Session", "Failed to update token.", Status.Error)
        }
    }
}

async function checkSession() {
    const { token } = getCommunicationInfo()
    let status: SessionStatus
    if (token.length > 3) {
        try {
            await apiGet('/api/is-session-valid')
            useStore.getState().updateState()
            notification("Session", "Continuing session.", Status.Info)
            status = SessionStatus.Valid
        } catch (err: unknown) {
            if (isApiError(err) && err.response.status === 401) {
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
    const user = useStore.getState().user
    const reqFormData: Partial<FormData> = Object.assign({}, formData)
    delete reqFormData.confirmPassword
    if (!changePassword) delete reqFormData.changePassword
    try {
        await apiPut(`/api/edit-user/${formData.email}`, reqFormData)
        notification("Edit Profile", "User information modified")
        useStore.setState({
            user: {
                email:      formData.email,
                screenName: formData.screenName,
                firstName:  formData.firstName,
                lastName:   formData.lastName,
                admin:      user.admin,
                owner:      user.owner,
                active:     user.active,
            }
        })
    } catch (err: unknown) {
        const msg = isApiError(err) ? (err.response.data as Record<string, unknown>)?.message : undefined
        notification("Edit Profile", `Profile save failed${msg ? `: ${msg}` : ''}`, Status.Error)
    }
}

async function logIn(email: string, password: string) {
    useStore.setState({ sessionValid: SessionStatus.Validating })
    try {
        const server = useStore.getState().address
        interface Resp {
            wsToken: string; token: string; screenName: string
            firstName: string; lastName: string; admin: boolean
            email: string; time: number; owner: boolean; wsPair: string; active: boolean
        }
        const resp = await apiFetch<Resp>('POST', `${server}/login`, { email, password })
        const now  = Date.now()
        useStore.setState({
            user: {
                firstName: resp.firstName, lastName: resp.lastName, email: resp.email,
                screenName: resp.screenName, admin: resp.admin, owner: resp.owner, active: resp.active,
            },
            sessionValid: SessionStatus.Valid,
            token:    resp.token,
            wsToken:  resp.wsToken,
            expire:   resp.time,
            signedIn: now,
            tokenTime: now,
            wsPair:   resp.wsPair,
        })
        const randomTime       = Math.ceil(Math.random() * 7200000)
        const refreshTimeOutID = setTimeout(refreshToken, 2 * 24 * 60 * 60 * 1000 + randomTime)
        useStore.getState().setRefreshTokenTimeout(refreshTimeOutID)
        notification("Logged In", "Successfully logged in")
        if (resp.active === false) {
            useStore.setState({ sessionValid: SessionStatus.Activate })
            useStore.getState().setNavigateTo(Path.Activate)
            return
        }
        await sleep(20)
        useStore.getState().updateState()
        useStore.setState({ sessionValid: SessionStatus.Valid })
        await initAudioDB()
        fetchAudioFiles()
        useStore.getState().setNavigateTo(Path.Welcome)
    } catch {
        notification("Log In", "Log In Failed", Status.Error)
        useStore.setState({ sessionValid: SessionStatus.NotValid })
    }
    await getWebColors()
}

async function updateState() {
    const { token } = getCommunicationInfo()
    if (token.length < 3 || useStore.getState().sessionValid === SessionStatus.Activate) return
    try {
        interface Update { user: UserInfo; alarms: Array<Alarm>; devices: Array<Device> }
        const userData  = await apiGet<Update>('/api/update')
        const deviceOld = useStore.getState().devices
        useStore.setState({
            user:    userData.user,
            alarms:  uniqueAlarms([...userData.alarms]),
            devices: uniqueDevices([...userData.devices]),
        })
        if (deviceOld.length === 0) {
            const deviceIds = userData.devices.map(d => d.id)
            useStore.getState().setViewableDevices(deviceIds)
        }
    } catch {
        notification("Update", "Update failed", Status.Error)
    }
    await getWebColors()
}

async function logOutProcedure() {
    try {
        await apiPost('/logout', { msg: "smell you later" })
    } catch {
        notification("Logged out", "Failed to clear user info", Status.Error)
        console.error("Clearing userinfo failed")
    }
    notification("Logged out", "Logged out", Status.Info)
    useStore.getState().setFetchQR(false)
    useStore.getState().clearDevices()
    useStore.getState().clearAdmin()
    useStore.getState().clearTimeouts()
    useStore.getState().clearAlarms()
    await deleteAudioDB()
    useStore.setState({
        user:         emptyUser,
        sessionValid: SessionStatus.NotValid,
        signedIn:     -1,
        expire:       -1,
        tokenTime:    -1,
        token:        '',
        wsToken:      '',
        wsPair:       '',
    })
    sessionStorage.clear()
}

async function fetchWsToken() {
    const { token } = getCommunicationInfo()
    if (token.length < 3) return null
    try {
        interface WSToken { wsToken: string }
        const keyJson = await apiGet<WSToken>('/api/ws-token')
        useStore.setState({ wsToken: keyJson.wsToken })
        return keyJson.wsToken
    } catch {
        return null
    }
}

async function forgotPassword(email: string) {
    const server = useStore.getState().address
    try {
        await apiFetch('PUT', `${server}/forgot-password/${email}`)
        notification("Reset Password", "Reset code for password was sent to email address")
    } catch {
        notification("Reset Password", "Password reset failed", Status.Error)
    }
}

async function resetPassword(reset: PasswordReset) {
    const server = useStore.getState().address
    try {
        await apiFetch('POST', `${server}/reset-password`, reset)
        notification("Reset Password", "Password reset successful")
        useStore.getState().setNavigateTo(Path.LogIn)
    } catch (err: unknown) {
        const msg = isApiError(err) ? (err.response.data as Record<string, unknown>)?.message : undefined
        notification("Reset Password", `Password reset failed${msg ? `: ${msg}` : ''}`, Status.Error)
    }
}

async function resendActivation(email: string) {
    const server = useStore.getState().address
    try {
        await apiFetch('PUT', `${server}/resend-activation/${email}`)
        notification("Resend Activation", "Activation code was sent to email address")
    } catch {
        notification("Resend Activation", "Activation resend failed", Status.Error)
    }
}

async function logInWithQr(scan: QrLoginScan) {
    const { server, token: qrToken } = { server: scan.server, token: scan.token }
    useStore.getState().setAddress(server)
    try {
        interface Resp {
            wsToken: string; token: string; screenName: string
            firstName: string; lastName: string; admin: boolean
            email: string; time: number; owner: boolean; wsPair: string; active: boolean
        }
        const resp = await apiFetch<Resp>('POST', `${server}/qr-login`, { qrToken })
        const now  = Date.now()
        useStore.setState({
            user: {
                firstName: resp.firstName, lastName: resp.lastName, email: resp.email,
                screenName: resp.screenName, admin: resp.admin, owner: resp.owner, active: resp.active,
            },
            sessionValid: SessionStatus.Valid,
            token:    resp.token,
            wsToken:  resp.wsToken,
            expire:   resp.time,
            signedIn: now,
            tokenTime: now,
            wsPair:   resp.wsPair,
        })
        const randomTime       = Math.ceil(Math.random() * 7200000)
        const refreshTimeOutID = setTimeout(refreshToken, 2 * 24 * 60 * 60 * 1000 + randomTime)
        useStore.getState().setRefreshTokenTimeout(refreshTimeOutID)
        notification("Logged In", "Successfully logged in")
        if (resp.active === false) {
            useStore.setState({ sessionValid: SessionStatus.Activate })
            useStore.getState().setNavigateTo(Path.Activate)
            return
        }
        await sleep(20)
        useStore.getState().updateState()
        useStore.setState({ sessionValid: SessionStatus.Valid })
        await initAudioDB()
        fetchAudioFiles()
        useStore.getState().setNavigateTo(Path.Welcome)
    } catch {
        notification("Log In", "Log In Failed", Status.Error)
        useStore.setState({ sessionValid: SessionStatus.NotValid })
    }
    await getWebColors()
}

// Daemon — exported so store.ts can call it after create()
export async function checkSessionStatus() {
    while (true) {
        await sleep(600)
        if (useStore.getState().sessionValid === SessionStatus.Unknown) {
            useStore.getState().validateSession()
        }
        await sleep(30000)
    }
}

export interface LoginSlice {
    wsToken:     string
    token:       string
    signedIn:    number
    sessionValid: SessionStatus
    user:        UserInfo
    expire:      number
    tokenTime:   number
    tunes:       Array<string>
    fingerprint: string
    navigateTo:  Path | null
    wsPair:      string
    captcha:     HTMLImageElement | null
    captchaSum:  string
    setToken:        (input: string) => void
    setSignedIn:     (t: number) => void
    setSessionValid: (s: SessionStatus) => void
    editUser:        (form: FormData, changePassword: boolean) => void
    setExpire:       (t: number) => void
    validateSession: () => void
    getUserInfo:     () => void
    logIn:           (user: string, password: string) => void
    logInWithQr:     (scan: QrLoginScan) => void
    logOut:          () => void
    refreshToKen:    () => void
    getWsToken:      () => string
    fetchWsToken:    () => Promise<string | null>
    updateState:     () => void
    setNavigateTo:   (path: Path | null) => void
    fetchCaptcha:    () => void
    activate:        (verification: string, captcha: string, accepted: boolean) => void
    forgotPassword:  (email: string) => void
    resetPassword:   (reset: PasswordReset) => void
    resendActivation:(email: string) => void
}

export const createLoginSlice: StateCreator<BoundStore, [], [], LoginSlice> = (set, get) => ({
    wsToken:     '',
    token:       '',
    signedIn:    -1,
    sessionValid: SessionStatus.Unknown,
    user:        emptyUser,
    expire:      -1,
    tokenTime:   -1,
    tunes:       [],
    wsPair:      "",
    fingerprint: generateRandomString(24) + Date.now().toString(36),
    captcha:     null,
    captchaSum:  "",
    navigateTo:  null,

    setToken:        (s) => set({ token: s }),
    setSignedIn:     (t) => set({ signedIn: t }),
    setSessionValid: (s) => set({ sessionValid: s }),
    setExpire:       (n) => set({ expire: n }),
    setNavigateTo:   (path) => set({ navigateTo: path }),

    editUser: async (form, changePassword) => { await editUserInfo(form, changePassword) },

    validateSession: async () => {
        set({ sessionValid: SessionStatus.Validating })
        const status = await checkSession()
        set({ sessionValid: status })
    },

    getUserInfo: async () => { await userInfoFetch() },

    logIn: async (email, password) => { await logIn(email, password) },

    logOut: async () => { logOutProcedure() },

    refreshToKen: async () => { await refreshToken(true) },

    getWsToken: () => get().wsToken,

    fetchWsToken: async () => {
        const wsToken = await fetchWsToken()
        if (wsToken) {
            set({ wsToken })
            return wsToken
        }
        return null
    },

    updateState: async () => {
        await postOfflineAlarms()
        await updateState()
    },

    fetchCaptcha:     async () => { await fetchCaptcha() },
    activate:         async (verification, captcha, accepted) => { await activate(verification, captcha, accepted) },
    forgotPassword:   async (email) => { await forgotPassword(email) },
    resetPassword:    async (reset) => { await resetPassword(reset) },
    resendActivation: async (email) => { await resendActivation(email) },
    logInWithQr:      async (scan)  => { await logInWithQr(scan) },
})
