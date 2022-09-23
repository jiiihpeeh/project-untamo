import { formString } from "./formString"
import './registerCheck.css'

import { guessCount } from "./registerConst"

const ShowSignal = (props) => {
    let signal = "failSign"
    if(props.pass){
        signal = "passSign"
    }
    return (
        <>
        <span className="hovertext" data-hover={props.message}>
            <span htmlFor='password' className={signal} />
            <label htmlFor='password'> {props.score}</label>
        </span>
        </>
    )
}


const RegisterPasswordCheck = (props) => {
    let pass = false
    let message = ""
    let score = "0/4"
    let form = props.values.current 
    let password =  (form.password) ? form.password: ""

    let passwords = props.values.passwords //props.passwordCheck
    let forms = props.values.forms
    if (password.length < 6){
        message = `Password too short.`
    }
    let passwordData = {}
    try{
        passwordData = passwords.get(password)
        score = `${passwordData.score}/4`
    } catch(err){}
    let formCheck = false
    try{
        formCheck = forms.get(formString(form))
        console.log("Form found")
    }catch(err){
        console.log("Form not found")
    }

    
    if (passwordData === undefined|| passwordData.guesses < guessCount){
        message = `${message}\nPassword too weak. `
    }
    if (!formCheck) {
        message = `${message}\nPassword might be guessable based on personal data.` 
    }
    let passwordCheck = false
    try {
        passwordCheck = passwords.has(password)
        console.log("Password found")
    }catch(err){}

    if(passwordCheck && formCheck){
        console.log("yup...")
        if (passwordData !== undefined && formCheck && passwordData.guesses >= passwordData.guesses.server_minimum){
            pass = true
        }
    }
    console.log(score, pass,message)
    console.log(props.values)
    if(message === ""){
        message = "Checks"
    }
    return (
        <ShowSignal score={score} pass={pass} message={message}/>
    )
}

export default RegisterPasswordCheck