import { formString } from "./formString"
import './registerCheck.css'
const RegisterSubmit = (props) => {
    let passSubmit = true;
    let checkmark = "𐄂";
    
    try{
        let values = props.values;
        let form = values.current;
        checkmark = (form.password.length >5 && form.password === form.password_confirm) ? "✓": "𐄂";
        passSubmit = (values.forms.get(formString(values.current)) &&
         values.passwords.get(form.password).guesses >= values.passwords.get(form.password).server_minimum) ? false : true;
    } catch(err){
        console.log("something wong");
    }
    passSubmit = (!passSubmit && checkmark === "✓") ? false: true;
    let checkStyle = (checkmark === "✓") ? "check_pass" : "check_fail";
    return (
        <>
            <label htmlFor="password_confirm" className={checkStyle}>{checkmark}</label>
            <br/>
            <input type="submit" value="Submit" disabled={passSubmit} onClick={props.onRegister}/>
        </>
        
    )
}
export default RegisterSubmit