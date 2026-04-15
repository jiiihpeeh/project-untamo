import { StateCreator } from 'zustand'
import type { BoundStore } from './storeTypes'
import { notification, Status } from '../components/notification'
import { apiGet, apiPost, apiPut, apiDelete, isApiError } from './api'
import { AdminAction } from '../type'
// circular import — safe: useStore only accessed inside function bodies after init
import { useStore } from './store'

type Command = {
    action: AdminAction | null
    id:     string | null
}

export enum DatabaseType {
    Sqlite = "sqlite",
    Mongo  = "mongo"
}

type OwnerConfig = {
    ownerId:        string
    urlDB:          string
    customUri:      string
    userDb:         string
    useCustomUri:   boolean
    passwordDb:     string
    email:          string
    emailIdentity:  string
    password:       string
    emailPort:      number
    emailServer:    string
    emailPlainAuth: boolean
    activateAuto:   boolean
    activateEmail:  boolean
    sessionLength:  number
    databasePath:   string
    databaseType:   DatabaseType
}

type UsersData = {
    user:   string
    email:  string
    active: boolean
    admin:  boolean
    owner:  boolean
}

interface ResponseData {
    adminToken:    string
    time:          number
    adminNavigate: boolean
}

const emptyCommand: Command = { id: null, action: null }

async function doAdminLogIn(): Promise<ResponseData> {
    const isAdmin  = useStore.getState().user.admin
    const password = useStore.getState().password
    if (!isAdmin) {
        return { adminToken: '', time: -1, adminNavigate: false }
    }
    try {
        const res = await apiPost<{ adminToken: string; time: number }>('/api/admin', { password })
        notification("Admin", "Admin rights granted")
        return { adminToken: res.adminToken, time: res.time, adminNavigate: true }
    } catch {
        if (useStore.getState().sessionValid !== undefined) {
            notification("Admin", "Cannot get admin rights", Status.Error)
        }
        return { adminToken: '', time: -1, adminNavigate: false }
    }
}

async function fetchUsersData() {
    const adminToken = useStore.getState().adminAccessToken
    try {
        const usersData = await apiGet<Array<UsersData>>('/admin/users', { adminToken })
        useStore.setState({ usersData })
    } catch (err) {
        //
    }
}

async function runAdminAction() {
    const usersData  = useStore.getState().usersData
    const command    = useStore.getState().command
    const adminToken = useStore.getState().adminAccessToken
    let user = usersData.filter(u => u.user === command.id)[0]

    switch (command.action) {
        case AdminAction.Activity:
            try {
                user.active = !user.active
                const body = { active: user.active, admin: user.admin }
                const data = await apiPut<Array<UsersData>>(`/admin/user/${command.id}`, body, { adminToken })
                useStore.setState({ usersData: data })
                notification("Change", `Changed user: ${command.id}`)
            } catch (err: unknown) {
                const detail = isApiError(err) ? ` ${(err.response.data as Record<string, unknown>)?.message ?? ''}` : ''
                notification("Change", `Change failed${detail}`, Status.Error)
                fetchUsersData()
            }
            break
        case AdminAction.Admin:
            try {
                user.admin = !user.admin
                const body = { active: user.active, admin: user.admin }
                const data = await apiPut<Array<UsersData>>(`/admin/user/${command.id}`, body, { adminToken })
                useStore.setState({ usersData: data })
                notification("Change", `Changed user: ${command.id}`)
            } catch (err: unknown) {
                const detail = isApiError(err) ? ` ${(err.response.data as Record<string, unknown>)?.message ?? ''}` : ''
                notification("Change", `Change failed${detail}`, Status.Error)
                fetchUsersData()
            }
            break
        case AdminAction.Delete:
            try {
                const data = await apiDelete<Array<UsersData>>(`/admin/user/${command.id}`, { adminToken })
                useStore.setState({ usersData: data })
                notification("Deleted", `Changed user: ${command.id}`)
            } catch (err: unknown) {
                const detail = isApiError(err) ? ` ${(err.response.data as Record<string, unknown>)?.message ?? ''}` : ''
                notification("Change", `Change failed${detail}`, Status.Error)
                fetchUsersData()
            }
            break
        default:
            break
    }
    useStore.setState({ command: { id: null, action: null } })
}

export interface AdminSlice {
    adminAccessToken: string
    time:             number
    password:         string
    usersData:        Array<UsersData>
    command:          Command
    adminNavigate:    boolean
    ownerConfig:      OwnerConfig | null
    setPassword:          (password: string) => void
    setAdminAccessToken:  (token: string) => void
    setTime:              (time: number) => void
    adminLogIn:           () => void
    getUsersData:         () => void
    adminAction:          () => void
    setOwnerConfig:       (config: OwnerConfig) => void
    getOwnerConfig:       () => void
    sendOwnerConfig:      () => void
    clearAdmin:           () => void
}

export const createAdminSlice: StateCreator<BoundStore, [], [], AdminSlice> = (set, get) => ({
    adminAccessToken: '',
    time:             -1,
    password:         "",
    usersData:        [],
    command:          emptyCommand,
    adminNavigate:    false,
    ownerConfig:      null,

    setPassword:         (password) => set({ password }),
    setAdminAccessToken: (token)    => set({ adminAccessToken: token }),
    setTime:             (time)     => set({ time }),

    adminLogIn: async () => {
        const credits = await doAdminLogIn()
        set({
            adminAccessToken: credits.adminToken,
            time:             credits.time,
            password:         "",
            adminNavigate:    credits.adminNavigate,
        })
    },

    getUsersData: async () => {
        await fetchUsersData()
    },

    adminAction: () => {
        runAdminAction()
    },

    setOwnerConfig: (config) => set({ ownerConfig: config }),

    getOwnerConfig: async () => {
        const adminToken = get().adminAccessToken
        try {
            const ownerConfig = await apiGet<OwnerConfig>('/admin/owner-settings', { adminToken })
            set({ ownerConfig })
        } catch (err) {
            //
        }
    },

    sendOwnerConfig: async () => {
        const adminToken  = get().adminAccessToken
        const ownerConfig = get().ownerConfig
        if (!ownerConfig) return
        try {
            const updated = await apiPost<OwnerConfig>('/admin/owner-settings', ownerConfig, { adminToken })
            notification("Owner Config", "Owner config was changed")
            set({ ownerConfig: updated })
        } catch (err) {
            notification("Owner Config", "Owner config change failed", Status.Error)
            get().getOwnerConfig()
        }
    },

    clearAdmin: () => set({
        adminAccessToken: '',
        time:             -1,
        password:         "",
        usersData:        [] as Array<UsersData>,
        command:          emptyCommand,
    }),
})
