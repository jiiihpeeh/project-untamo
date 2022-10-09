import axios from "axios";
import { SessionContext } from "../contexts/SessionContext";
import { useContext, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { clearAudio } from "../audiostorage/audioDatabase";

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

const LogOut = () => {
    const navigate = useNavigate()
    const { token } = useContext(SessionContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();

    const logOut = async() =>{
        try {
            let res = await axios.get('http://localhost:3001/logout', {
                headers: {'token': token}
            });
            console.log(res.data);
            localStorage.clear();
            await clearAudio();
            navigate('/login')
        }catch(err){};
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
                <Button colorScheme='red' onClick={logOut} ml={3}>
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