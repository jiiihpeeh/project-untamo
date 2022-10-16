
import { useState} from "react";
import {
        Link,
        Text,
        Checkbox, 
        Flex,
        IconButton,
        } from '@chakra-ui/react';
import { EditIcon, DeleteIcon} from '@chakra-ui/icons';
import DeviceDelete from "./DeviceDelete";
import DeviceEdit from "./DeviceEdit";



const DeviceMenuActions = (props) => {
    const [ editDialogState, setEditDialogState ] = useState(false);
    const [ deleteDialogState, setDeleteDialogState ] = useState(false);
  
    const openDelete = () => {
      setDeleteDialogState(true);
    };
    const openEdit = () => {
      setEditDialogState(true);
    };
   
    return (
      <>                    
        <Flex id={`linkview-${props.device.id}`} key={`viewedDevice-${props.device.id}`}>
          <Link  onClick={()=> {console.log('checks')}} >
          <Checkbox defaultChecked><Text>
                {props.device.deviceName}
              </Text>
          </Checkbox>
          </Link>
         
          <IconButton size='xs' onClick={openEdit} icon={<EditIcon/>}/>
          
          <IconButton size='xs' onClick={openDelete} icon={<DeleteIcon/>} ml="5.5%"/>
        </Flex>
        <DeviceDelete device={props.device} 
                      deleteDialogState={deleteDialogState} 
                      setDeleteDialogState={setDeleteDialogState} />
        <DeviceEdit device={props.device} 
                      editDialogState={editDialogState} 
                      setEditDialogState={setEditDialogState} />
      </>
    )

};

export default DeviceMenuActions;