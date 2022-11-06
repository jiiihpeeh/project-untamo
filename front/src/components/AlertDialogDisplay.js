import { AlertDialogOverlay, AlertDialogContent, 
    AlertDialogHeader, AlertDialogBody, 
    AlertDialogFooter, Button , useDisclosure} from "@chakra-ui/react";
import { useRef } from "react";
const AlertDialogDisplay = (props) =>{
    const cancelRef = useRef();
    //const {onClose} = useDisclosure();

    return(
        <AlertDialogOverlay>
        <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            {props.action}
            </AlertDialogHeader>
            <AlertDialogBody>
            {props.message}
            </AlertDialogBody>
            <AlertDialogFooter>
            <Button ref={cancelRef} onClick={props.onClose}>
                Cancel
            </Button>
            <Button colorScheme='red' onClick={props.onClose} ml={3}>
                Delete
            </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialogOverlay>
    )
}
export default AlertDialogDisplay;