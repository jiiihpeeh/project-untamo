import { create } from 'zustand'
import { notification, Status } from '../components/notification'
import { getCommunicationInfo, validSession } from '../stores'
import { AdminAction } from '../type'
import useLogIn from './loginStore'
import { Body, getClient, ResponseType } from "@tauri-apps/api/http"
import { isSuccess } from '../utils'

type Command = {
    action: AdminAction|null,
    id: string|null,
}

type OwnerConfig = {
    ownerId: string,
    urlDB: string,
    customUri: string,
    userDb: string,
    useCustomUri: boolean,
    passwordDb: string,
    email: string,
    emailIdentity: string,
    password: string,
    emailPort: number,
    emailServer: string,
    emailPlainAuth: boolean,
    activateAuto: boolean,
    activateEmail: boolean,
    sessionLength: number,
}



const emptyCommand = {id:null, action:null}
type UseAdmin = {
    token: string,
    time: number,
    password: string,
    usersData: Array<UsersData>
    command : Command
    adminNavigate: boolean,
    ownerConfig: OwnerConfig|null, 
    setPassword: (password: string) => void,
    setToken: (token: string) => void,
    setTime: (time:number) => void,
    logIn: () => void,
    getUsersData: () => void,
    adminAction: () => void,
    setOwnerConfig: (config: OwnerConfig) => void,
    getOwnerConfig: () => void,
    sendOwnerConfig: () => void,
    clear:()=> void,
}
type UsersData = {
    user: string,
    email: string,
    active: boolean,
    admin: boolean,
    owner: boolean
}
//ownerId":"6461f3091330e40a7e528abc","urlDB":"0.0.0.0:27017","customUri":"","userDb":"root","useCustomUri":false,"passwordDb":"example","email":"","password":"","emailPort":"","emailServer":"","emailTLS":false,"activateAuto":false,"activateEmail


interface ResponseData {
    adminToken: string,
    time: number,
    adminNavigate: boolean
}

async function logIn() {
    const { server, token } = getCommunicationInfo()

    const admin = useLogIn.getState().user.admin
    const password = useAdmin.getState().password

    if (!admin) {
        return {
            adminToken: '',
            time: -1,
            adminNavigate: false
        } as ResponseData
    }
    try {
        const client = await getClient()
        let res = await client.request(
            {
                url: `${server}/api/admin`,
                method: "POST",
                body: Body.json({ password: password }),
                responseType: ResponseType.JSON,
                headers: {
                    token: token
                }
            }
        )
        isSuccess(res)
        notification("Admin", "Admin rights granted")
        const data = res.data as ResponseData
        return {
            adminToken: data.adminToken,
            time: data.time,
            adminNavigate: true
        } as ResponseData

    } catch (err: any) {
        //console.log(err)
        (validSession()) ? notification("Admin", "Cannot get admin rights", Status.Error) : {}
        return {
            adminToken: '',
            time: -1
        } as ResponseData
    }
} 

async function getUsersData() {
    const { server, token } = getCommunicationInfo()
    const adminToken = useAdmin.getState().token
    try {
        const client = await getClient()
        let res = await client.request(
            {
                url: `${server}/admin/users`,
                method: "GET",
                responseType: ResponseType.JSON,
                headers: {
                    token: token,
                    adminToken: adminToken
                }
            }
        )
        isSuccess(res)
        let usersData = res.data as Array<UsersData>
        useAdmin.setState({ usersData: usersData })
    } catch (err) {
        //console.log(err)
    }
}

async function runAdminAction() {
    const { server, token } = getCommunicationInfo()
    const usersData = useAdmin.getState().usersData
    const command = useAdmin.getState().command
    let user = usersData.filter(user => user.user === command.id)[0]

    const adminToken = useAdmin.getState().token
    switch (command.action) {
        case AdminAction.Activity:
            try {
                user.active = !user.active
                let body = { active: user.active, admin: user.admin }
                const client = await getClient()
                let res = await client.request(
                    {
                        url: `${server}/admin/user/${command.id}`,
                        method: "PUT",
                        body: Body.json(body),
                        responseType: ResponseType.JSON,
                        headers: {
                            token: token,
                            adminToken: adminToken
                        }
                    }
                )
                isSuccess(res)
                useAdmin.setState(
                    {
                        usersData: res.data as Array<UsersData>
                    }
                )
                notification("Change", `Changed user: ${command.id}`)
            } catch (err: any) {
                notification("Change", `Change failed ${err.data}`, Status.Error)
                //console.log("err: ", err)
                getUsersData()
            }
            break
        case AdminAction.Admin:
            try {
                user.admin = !user.admin
                let body = {
                    active: user.active,
                    admin: user.admin
                }
                const client = await getClient()
                let res = await client.request(
                    {
                        url: `${server}/admin/user/${command.id}`,
                        method: "PUT",
                        body: Body.json(body),
                        responseType: ResponseType.JSON,
                        headers: {
                            token: token,
                            adminToken: adminToken
                        }
                    }
                )
                isSuccess(res)
                useAdmin.setState(
                    {
                        usersData: res.data as Array<UsersData>
                    }
                )
                notification("Change", `Changed user: ${command.id}`)
            } catch (err: any) {
                notification("Change", `Change failed ${err.data}`, Status.Error)
                //console.log("err: ", err)
                getUsersData()
            }

            break
        case AdminAction.Delete:
            try {
                const client = await getClient()
                let res = await client.request(
                    {
                        url: `${server}/admin/user/${command.id}`,
                        method: "DELETE",
                        responseType: ResponseType.JSON,
                        headers: {
                            token: token,
                            adminToken: adminToken
                        }
                    }
                )
                isSuccess(res)
                useAdmin.setState(
                    {
                        usersData: res.data as Array<UsersData>
                    }
                )
                notification("Deleted", `Changed user: ${command.id}`)
            } catch (err: any) {
                notification("Change", `Change failed ${err.data}`, Status.Error)
                //console.log("err: ", err) 
                getUsersData()
            }
            break
        default:
            break
    }
    useAdmin.setState({ command: { id: null, action: null } })
}
const useAdmin = create<UseAdmin>((set,get) => (
    {
        token: '',
        time:-1,
        password: "",
        usersData: [],
        command: emptyCommand,
        adminNavigate: false,
        ownerConfig: null,
        setPassword: (password) => set(
            {
                password: password
            }
        ),
        setToken: (token) => set
            ( 
                {
                    token: token
                }
        ),
        setTime: (time) => set
            (
                {
                    time: time
                }
        ),
        logIn: async () => {
            let credits = await logIn()
            set (
                {
                    token: credits.adminToken,
                    time: credits.time,
                    password: "",
                    adminNavigate: credits.adminNavigate
                }
            )
        },
        getUsersData: async()=>{
            await getUsersData()
        },
        adminAction:() =>{
            runAdminAction()
        },
        setOwnerConfig: (config) => set( 
            {
                ownerConfig: config
            }
        ),
        getOwnerConfig: async() => {
            const { server, token } = getCommunicationInfo()
            const adminToken = useAdmin.getState().token
            try {
                const client = await getClient()
                let res = await client.request(
                    {
                        url: `${server}/admin/owner-settings`,
                        method: "GET",
                        responseType: ResponseType.JSON,
                        headers: {
                            token: token,
                            adminToken: adminToken
                        }
                    }
                )
                isSuccess(res)
                let ownerConfig = res.data as OwnerConfig

                set({ ownerConfig: ownerConfig })
            } catch (err) {
                //console.log(err)
            }
        },
        sendOwnerConfig: async() => {
            const { server, token } = getCommunicationInfo()
            const adminToken = useAdmin.getState().token
            let conf = get().ownerConfig
            if (!conf) {
                return
            }
            //conf as OwnerConfig
            try {
                const client = await getClient()
                let res = await client.request(
                    {
                        url: `${server}/admin/owner-settings`,
                        method: "POST",
                        body: Body.json(conf),
                        responseType: ResponseType.JSON,
                        headers: {
                            token: token,
                            adminToken: adminToken
                        }
                    }
                )
                isSuccess(res)
                notification("Owner Config", "Owner config was changed")
                let data = res.data as OwnerConfig
                set(
                    { 
                        ownerConfig: data 
                    }
                )
            } catch (err) {
                //console.log(err)
                notification("Owner Config", "Owner config change failed", Status.Error)
                get().getOwnerConfig()

            }
        },

        clear: () => set
            (
                {
                    token: '',
                    time: -1,
                    password: "",
                    usersData: [] as Array<UsersData>,
                    command: emptyCommand
                }
        ),

    }
))

export default useAdmin
