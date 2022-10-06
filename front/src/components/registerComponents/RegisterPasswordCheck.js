import { formString } from "./formString";
import { Tooltip, Text, UnorderedList, ListItem } from '@chakra-ui/react';
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons';

const ShowSignal = (props) => {
    let signal = <WarningTwoIcon/>;
    if(props.pass){
        signal = <CheckCircleIcon/>;
    }
    let info = <Text>{signal} {props.score}</Text> ;
    let messageItems = props.message.map((message) =>  <ListItem>{message}</ListItem>);
    let message = <UnorderedList>{messageItems}</UnorderedList>;

    return (
        <>
        <Tooltip label={message}>
            {info}
        </Tooltip>        
        </>
    )
}


const RegisterPasswordCheck = (props) => {
    let pass = false;
    let message = [];
    let score = "0/4";
    let form = props.values.current;
    let password =  (form.password) ? form.password: "";

    let passwords = props.values.passwords; //props.passwordCheck
    let forms = props.values.forms;
    if (password.length < 6){
        message.push(`Password too short.`);
    }
    let passwordData = {}
    try{
        passwordData = passwords.get(password);
        score = `${passwordData.score}/4`;
    } catch(err){}
    let formCheck = false;
    try{
        formCheck = forms.get(formString(form));
        console.log("Form found");
    }catch(err){
        console.log("Form not found");
    }

    
    if (passwordData === undefined|| passwordData.guesses < passwordData.server_minimum){
        message.push("Password too weak.");
    }
    if (!formCheck) {
        message.push("Password might be guessable based on personal data.");
    }
    let passwordCheck = false;
    try {
        passwordCheck = passwords.has(password);
        console.log("Password found");
    }catch(err){}

    if(passwordCheck && formCheck){
        console.log("yup...");
        if (passwordData !== undefined && formCheck && passwordData.guesses >= passwordData.server_minimum){
            pass = true;
        }
    }
    console.log(score, pass,message);
    console.log(props.values);
    if(message === ""){
        message = ["Checks"];
    }
    return (
        <ShowSignal score={score} pass={pass} message={message}/>
    )
}

export default RegisterPasswordCheck;