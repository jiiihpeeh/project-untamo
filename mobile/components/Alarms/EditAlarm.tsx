import { Fab, Button, Div, Text } from "react-native-magnus";
import React, { useRef, useState, useEffect } from 'react';
import Icon from "react-native-vector-icons/EvilIcons";
import AlarmSelector from "./AlarmComponents/AlarmSelector";

import DeleteAlarm from "./DeleteAlarm";
const EditAlarm = () => {
    
    return( <>       
                <AlarmSelector/>
                <DeleteAlarm/>
            </>)
}

export default EditAlarm;