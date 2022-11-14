import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button, ButtonGroup,
    useDisclosure, 
    Text, FormLabel,Input,
  } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FocusLock } from '@chakra-ui/focus-lock';
import { useState, useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext';
import { AdminContext } from '../contexts/AdminContext';
import axios from 'axios';
import { notification } from "./notification";

const AdminLogin = () => {
    const { isOpen, onToggle, onClose } = useDisclosure()
    const [ adminPassword, setAdminPassword ] = useState('');
    const {server, token }  = useContext(SessionContext);
    const {setAdminTime, setAdminToken} = useContext(AdminContext);
    const navigate = useNavigate();
    const onLogIn = async () => {
        try{
            let res = await axios.post(`${server}/api/admin`,{password: adminPassword},{headers:{token:token}});
            //console.log(res)
            setAdminToken(res.data.adminToken);
            setAdminTime(res.data.ttl);
            notification("Admin", "Admin rights granted");
            onClose();
            navigate('/admin')
        }catch(err){
            console.log(err)
            notification("Admin", "Cannot get admin rights", "error");
        }  
    } 



    return (
      <>
        <Text mr={5} onClick={onToggle}>
          Admin LogIn
        </Text>
        <Modal
          returnFocusOnClose={false}
          isOpen={isOpen}
          onClose={onClose}
          closeOnBlur={false}
        >
          {/* <PopoverTrigger>
            <Button colorScheme='pink'>Popover Target</Button>
          </PopoverTrigger> */}
          <ModalContent>
              <ModalHeader fontWeight='semibold'>Request admin rights?</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
              <FocusLock returnFocus persistentFocus={false}>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" 
                         value={adminPassword} 
                         onChange={(e)=> setAdminPassword(e.target.value)}
                         />
              </FocusLock>
              </ModalBody>
              <ModalFooter display='flex' justifyContent='flex-end'>
                <ButtonGroup size='sm'>
                  <Button variant='outline' onClick={onClose}>Cancel</Button>
                  <Button colorScheme='red' onClick={onLogIn}>Apply</Button>
                </ButtonGroup>
              </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
export default AdminLogin;