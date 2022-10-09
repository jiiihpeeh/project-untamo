import axios from "axios";
import { SessionContext } from "../contexts/SessionContext";
import { useContext, useRef} from "react";
//import { useNavigate } from "react-router-dom";
import { deleteAudioDB } from "../audiostorage/audioDatabase";

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    useDisclosure,
    Link,
    Text
  } from '@chakra-ui/react';
  import { notification } from "./notification";

const LogOut = () => {
    //const navigate = useNavigate()
    const { token } = useContext(SessionContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();

    const logOut = async() =>{
        try {
            let res = await axios.post('http://localhost:3001/logout', {msg: "smell you later"}, {
                headers: {'token': token}
            });
            console.log(res.data);
            notification("Logged out", "Log out succcesful", 'info')
            try{
                localStorage.clear();
                //await clearAudio();
                await deleteAudioDB();
                //navigate('/login');
            }catch(err){
                notification("Logged out", "Failed to clear user info", 'error')
                console.log("Clearing userinfo failed")
            }

        }catch(err){
            notification("Log out", "Log out failed", 'error')
            console.log("Log out failed")
        };
    }

  
    return (
      <>
        <Link  onClick={onOpen}>
            <Text as='b'>
                Log Out
            </Text>
        </Link>
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                Log Out?
              </AlertDialogHeader>
  
              <AlertDialogBody>
                Are you sure?
              </AlertDialogBody>
  
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme='red' onClick= {() => {logOut() ; onClose()}} ml={3}>
                  OK
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    )

};

export default LogOut;