
import { useState, useContext} from "react";
import {
        Link,Text,
        Checkbox,
        IconButton,Tooltip, 
        Table, Tr, Td,
        } from '@chakra-ui/react';
import { EditIcon, DeleteIcon} from '@chakra-ui/icons';
import DeviceDelete from "./DeviceDelete";
import DeviceEdit from "./DeviceEdit";
import { Icon } from "@chakra-ui/react";
import { DeviceContext } from "../contexts/DeviceContext";
import deviceIcons from "./DeviceIcons";
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
      return viewableDevices.indexOf(id) !== -1;
    };
    return (
      <>                    
        <Table  id={`linkview-${props.device.id}`} key={`viewedDevice-${props.device.id}`} variant="unstyled" size="sm">
          <Tr>
          <Td>
            <Link  onClick={flipState} onDoubleClick={()=>{}} >
            <Checkbox isChecked={checkViewState(props.device.id)}>
            <Tooltip label={props.device.type} fontSize='md'>
                <Text>
                  {props.device.deviceName} <Icon as={deviceIcons(props.device.type)}></Icon>
                </Text>
            </Tooltip>
            </Checkbox>
            </Link>
          </Td>
          <Td>
            <Tooltip label='Edit device' fontSize='md'>
              <IconButton alignItems={"right"} size='xs' onClick={openEdit} icon={<EditIcon/>} ml="5.5%"/>
            </Tooltip>
          </Td>
          <Td>
            <Tooltip label='Delete device' fontSize='md'>
              <IconButton alignItems={"right"}  size='xs' onClick={openDelete} icon={<DeleteIcon/>} ml="5.5%"/>
            </Tooltip>
          </Td>
        </Tr>
        </Table>
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