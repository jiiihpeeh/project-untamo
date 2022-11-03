import { 
        AlertDialog,
        AlertDialogOverlay,
        AlertDialogContent,
        AlertDialogHeader,
        AlertDialogBody,
        AlertDialogFooter,
        Button,
        Text,
        useDisclosure } from "@chakra-ui/react"; 
import { useRef, useContext } from "react";
import axios from "axios";
import { DeviceContext } from "../contexts/DeviceContext";
import { SessionContext } from "../contexts/SessionContext";
import { notification } from "./notification";

const DeviceDelete = (props) => {
    const { onClose } = useDisclosure();
    const cancelRef = useRef();
    const { devices, setDevices, currentDevice, setCurrentDevice,viewableDevices, setViewableDevices  } = useContext(DeviceContext);
    const { token, server } = useContext(SessionContext);
    const cancel = () => {
        props.setDeleteDialogState(false); 
        onClose();
    };
    const deleteDevice = async () => {
        try {
            let res = await axios.delete( `${server}/api/device/` + props.device.id, 
                        {headers: {token: token}} );
            console.log(res.data);
            let devicesupdated = devices.filter(device => device.id !== props.device.id) ;
            setDevices(devicesupdated);
            if(currentDevice === props.device.id){
                setCurrentDevice('');
                localStorage['currentDevice'] = undefined;
            }
            if (viewableDevices.indexOf(props.device.id) !== -1){
              let viewableDevicesFilt = viewableDevices.filter(device => device !== props.device.id);
              setViewableDevices(viewableDevicesFilt);
              localStorage['viewableDevices'] = JSON.stringify(viewableDevicesFilt);
            }
            localStorage['devices'] = JSON.stringify(devicesupdated);
            cancel();
        }catch(err){
            console.log(err);
            notification("Device", "Can not delete devicce", "error");
        };
    };
    return (
      <>
        <AlertDialog
                    isOpen={props.deleteDialogState}
                    leastDestructiveRef={cancelRef}
                    onClose={onClose}
        >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete device <Text as='b'>{props.device.deviceName}</Text>?
            </AlertDialogHeader>
  
            <AlertDialogBody>
              Are you sure?
            </AlertDialogBody>
  
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={cancel}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick= {deleteDevice} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
    )
  };
export default DeviceDelete;  