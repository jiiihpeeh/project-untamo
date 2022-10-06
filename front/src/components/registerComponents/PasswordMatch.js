import {Text} from '@chakra-ui/react'
import { CheckCircleIcon, NotAllowedIcon } from '@chakra-ui/icons';
const PasswordMatch = (props) => {

    let checkmark = <NotAllowedIcon/>
    try{
        let form = props.values.current;
        checkmark = (form.password.length >5 && form.password === form.password_confirm) ? <CheckCircleIcon/>: <NotAllowedIcon/>;
    } catch(err){
        console.log("something wong");
    }

    return (
        <>
            <Text>{checkmark}</Text>
        </>
        
    )
}
export default PasswordMatch;