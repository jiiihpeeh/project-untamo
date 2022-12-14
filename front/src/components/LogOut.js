import axios from "axios";
import { SessionContext } from "../contexts/SessionContext";
import { DeviceContext } from "../contexts/DeviceContext";
import { AdminContext } from "../contexts/AdminContext";
import { useContext, useRef} from "react";
import { deleteAudioDB } from "../audiostorage/audioDatabase";
import { useNavigate } from "react-router-dom";

import {
    AlertDialog,AlertDialogBody,AlertDialogFooter,AlertDialogHeader,
    AlertDialogContent,AlertDialogOverlay,Button,useDisclosure,Text
  } from '@chakra-ui/react';
  import { notification } from "./notification";

const LogOut = () => {
    const {  setCurrentDevice, setDevices } = useContext(DeviceContext);
    const { token, setToken,  setUserInfo,  setSessionStatus, server } = useContext(SessionContext);
    const { setAdminToken, setAdminTime } = useContext(AdminContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const navigate = useNavigate();
    const logOut = async() =>{
        try {
            let res = await axios.post(`${server}/logout`, {msg: "smell you later"}, {
                headers: {'token': token}
            });
            //console.log(res.data);
            notification("Logged out", "Logged out", 'info');
            setToken(undefined);
            setSessionStatus(false);
            setUserInfo({});
            setCurrentDevice(undefined);
            setDevices([]);
            setAdminToken(''); 
            setAdminTime(0);
            try{
                localStorage.clear();
                sessionStorage.clear();
                //await clearAudio();
                await deleteAudioDB();
            }catch(err){
                notification("Logged out", "Failed to clear user info", 'error');
                console.error("Clearing userinfo failed");

            };
            navigate('/login');
        }catch(err){
            notification("Log out", "Log out failed", 'error');
            console.log("Log out failed");
        };
    };

    return (
      <>
        <Text  onClick={onOpen} id="logout-button" key="logout-button" >
            <Text as='b'>
                Log Out
            </Text>
        </Text>
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