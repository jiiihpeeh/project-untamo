import {
    AlertDialog,
    useDisclosure,
    AlertDialogOverlay, AlertDialogContent, 
    AlertDialogHeader, AlertDialogBody, 
    AlertDialogFooter, Button
  } from '@chakra-ui/react';
import { useRef, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { SessionContext } from '../contexts/SessionContext';
import { AdminContext } from '../contexts/AdminContext';
import { notification } from './notification';

const AdminChangeActivity = (props) => {
    const [ message, setMessage ] = useState({action:'', message:'', button:''})
    const { onClose } = useDisclosure();
    const cancelRef = useRef();
    const { token, server }  = useContext(SessionContext);
    const { adminToken } = useContext(AdminContext);
 
    const cancelDialog = () => {
        props.setConfirmOpen(false);
        onClose();
    }
 
    const fetcher = async () => {
        try{
            let res = await axios.get(`${server}/admin/users`, {
                headers:{
                    token: token, 
                    adminToken: adminToken
                }
            })
            props.setUserData(res.data)
        }catch(err){
            console.log(err)
        }
    }

    const acceptChange = async () => {
        let user = props.userData.filter(user => user.userID === props.command.id)[0];
        switch(props.command.action){
            case 'activity': 
                try{
                    user.active = !user.active;
                    let body = {active: user.active, admin: user.admin};
                    let res = await axios.put(`${server}/admin/user/${props.command.id}`, body, {
                        headers: {token: token, adminToken: adminToken}
                    });
                    props.setUserData(res.data);
                    notification("Change", `Changed user: ${props.id}`);
                }catch(err){
                    notification("Change", `Change failed ${err.data}`, "error");
                    console.log("err: ", err);
                    fetcher();
                }
                break;
            case 'admin':
                try{
                    user.admin = !user.admin;
                    let body = {active: user.active, admin: user.admin};
                    let res = await axios.put(`${server}/admin/user/${props.command.id}`, body, {
                        headers: {token: token, adminToken: adminToken}
                    });
                    props.setUserData(res.data)
                    notification("Change", `Changed user: ${props.command.id}`);
                }catch(err){
                    notification("Change", `Change failed ${err.data}`, "error");
                    console.log("err: ", err);
                    fetcher();
                }
                
                break;
            case 'delete':
                try{
                    let res = await axios.delete(`${server}/admin/user/${props.command.id}`, {
                        headers: {token: token, adminToken: adminToken}
                    });
                    props.setUserData(res.data);
                    notification("Deleted", `Changed user: ${props.command.id}`);
                }catch(err){
                    notification("Change", `Change failed ${err.data}`, "error");
                    console.log("err: ", err); 
                    fetcher();                   
                }
                break;
            default:
                break;
        }
        props.setConfirmOpen(false);
        onClose();
        props.setCommand({id:null, action:null});
        
    }
    useEffect(() => {
        switch(props.command.action){
            case 'delete':
                setMessage({action: 'Delete?', 
                            message: 'Delete user? User information will be erased.',
                            button: 'Delete user'
                        });
                break;
            case 'admin':
                setMessage({ action: 'Admin Status',
                             message: 'Admin status of the user will be changed',
                             button: "Change Admin Status" 
                            });
                break;
            case 'activity':
                setMessage({ action: 'Activity Status', 
                            message: 'Activity status of the user will be changed. Current sessions will be erased if accepted and activity is turned OFF',
                            button: "Change Activity Status"
                        });
                break;
            default:
                break;
        }
    },[props.command])


    return (
      <>
        <AlertDialog
          isOpen={props.confirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
        <AlertDialogOverlay>
        <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                {message.action}
            </AlertDialogHeader>
            <AlertDialogBody>
                {message.message}
            </AlertDialogBody>
            <AlertDialogFooter>
            <Button ref={cancelRef} onClick={cancelDialog}>
                Cancel
            </Button>
            <Button colorScheme='red' onClick={acceptChange} ml={3}>
                {message.button}
            </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialogOverlay>
        </AlertDialog>
      </>
    )
  }

  export default AdminChangeActivity;