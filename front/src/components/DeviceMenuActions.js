
import { useState, useContext} from "react";
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

import { DeviceContext } from "../contexts/DeviceContext";


const DeviceMenuActions = (props) => {
    const [ editDialogState, setEditDialogState ] = useState(false);
    const [ deleteDialogState, setDeleteDialogState ] = useState(false);
    const { viewableDevices, setViewableDevices } = useContext(DeviceContext);
    const openDelete = () => {
      setDeleteDialogState(true);
    };
    const openEdit = () => {
      setEditDialogState(true);
    };
    const flipState = (event) => {
       event.preventDefault();
       if(viewableDevices.indexOf(props.device.id) === -1){
          let addedDevices = [...viewableDevices,props.device.id];
          setViewableDevices(addedDevices);
          localStorage.setItem("viewableDevices", JSON.stringify(addedDevices));
      }else {
        let viewableDevicesFiltered = viewableDevices.filter(device => device !== props.device.id);
        setViewableDevices(viewableDevicesFiltered);
        localStorage.setItem("viewableDevices", JSON.stringify(viewableDevicesFiltered));
      }
    };
    const checkViewState = (id) => {
      console.log(id)
      console.log(viewableDevices.indexOf(id) !== -1)
      return viewableDevices.indexOf(id) !== -1;
    };
    return (
      <>                    
        <Flex id={`linkview-${props.device.id}`} key={`viewedDevice-${props.device.id}`}>
          <Link  onClick={flipState} onDoubleClick={()=>{}} >
          <Checkbox isChecked={checkViewState(props.device.id)}>
              <Text>
                {props.device.deviceName}
              </Text>
          </Checkbox>
          </Link>
         
          <IconButton size='xs' onClick={openEdit} icon={<EditIcon/>} ml="5.5%"/>
          
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