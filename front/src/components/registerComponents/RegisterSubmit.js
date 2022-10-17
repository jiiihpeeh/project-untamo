import { formString } from "./formString"
import { Button } from '@chakra-ui/react'
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
    return (
        <>
            <Button type="submit"  disabled={passSubmit} onClick={props.onRegister} mt="1%" mb="1%" >Submit</Button>
        </>
        
    )
}
export default RegisterSubmit;