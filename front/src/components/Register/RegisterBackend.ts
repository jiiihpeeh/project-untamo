import { create } from 'zustand'
import axios from 'axios'
import { useServer } from '../../stores'
import { notification, Status } from '../notification'


type FormData = {
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    question: string,
}


type RegisterData = {
    email: string,
    setEmail: (email:string) =>void,
    firstName: string,
    setFirstName: (firstName:string) => void,
    lastName: string,
    setLastName: (lastName:string) => void,
    password: string,
    setPassword: (password:string) => void,
    formCheck: boolean,
    setFormCheck:(to:boolean) =>void,
    registered: boolean,
    setRegistered: (to: boolean) => void,
    confirmPassword: string,
    setConfirmPassword: (confirmPassword:string) => void,
    formTimeout: null| NodeJS.Timeout
    setFormTimeOut: (timeOut: NodeJS.Timeout) =>void,
    clearFormTimeout: () => void,
    passwordTimeout: null| NodeJS.Timeout
    setPasswordTimeOut: (timeOut: NodeJS.Timeout) =>void,
    question : string,
    setQuestion: (question:string) => void,
    clearPasswordTimeout: () => void,
    formData: () =>FormData,
    register: () => void,
    clear: () => void
}

const useRegister = create<RegisterData>((set,get) => (
    {
       email: '',
       setEmail: (email: string) =>set(
            {
                email: email
            }
        ),
       firstName: '',
       setFirstName: (firstName) =>set(
            {
                firstName: firstName
            } 
       ),
       lastName:'',
       setLastName: (lastName) =>set(
        {
            lastName: lastName
        } 
       ),
       password: '',
       setPassword: (password) =>set(
        {
            password: password
        } 
       ),    
       formCheck: false,
       setFormCheck: (formCheck) =>set(
        {
            formCheck: formCheck
        } 
       ),     
       registered: false,
       setRegistered: (to:boolean) => set(
                {
                    registered: to
                }
        ),
       confirmPassword:'',
       setConfirmPassword: (confirmPassword) =>set(
        {
            confirmPassword: confirmPassword
        } 
       ),      
       formData: () => {
                        return {
                                    firstName: get().firstName,
                                    lastName: get().lastName,
                                    email: get().email,
                                    password: get().password,
                                    question: get().question
                                }
       },
       register: async() =>{
            await onRegister()
       },
       formTimeout: null,
       setFormTimeOut: (timeOut) => set(
                        {
                            formTimeout: timeOut
                        }
       ),
       clearFormTimeout: () => {
            let timeOut =  get().formTimeout
            if(timeOut){
                clearTimeout(timeOut)
            }
       },
       passwordTimeout: null,
       setPasswordTimeOut: (timeOut) => set(
                        {
                            passwordTimeout: timeOut
                        }
       ),
       clearPasswordTimeout: () => {
            let timeOut =  get().passwordTimeout
            if(timeOut){
                clearTimeout(timeOut)
            }
       },
        question: '',
        setQuestion: (question) => set(
                                        {
                                            question: question
                                        }
       ),
       clear: () => {
        set(
            {
                email: '',
                firstName: '',
                lastName:'',
                password: '',
                formCheck: false,
                registered: false,
                confirmPassword: '',
                question: ''
            }

        )
       }
    }
))

async function onRegister() {
    const server = useServer.getState().address
    const formData = useRegister.getState().formData()
    try {
        const res = await axios.post(`${server}/register`, formData)
        //console.log(res.data)
        notification("Registration", "User was registered")
        useRegister.setState({ registered: true })
    } catch (err) {
        //console.error(err)
        notification("Registration", "Registration failed", Status.Error)
    }
}
export default useRegister

