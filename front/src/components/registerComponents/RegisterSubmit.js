import { guessCount } from "./registerConst"
import { formString } from "./formString"
const RegisterSubmit = (props) => {
    let passSubmit = true
    try{
        if (props.values.forms.get(formString(props.values.current)) &&
         props.values.passwords.get(props.values.current.password).guesses >= props.values.passwords.get(props.values.current.password).server_minimum){
            passSubmit = false
        }
    } catch(err){
        console.log("something wong")
    }
    return (
        <input type="submit" value="Submit" disabled={passSubmit}/>
    )
}
export default RegisterSubmit