import { GoBrowser as Browser } from 'react-icons/go'
import { MdComputer as Desktop } from 'react-icons/md'
import { FiTablet as Tablet } from 'react-icons/fi'
import { MdDeviceUnknown as Other, MdOutlineDevicesOther as IoT } from 'react-icons/md'
import { DeviceType } from '../../type'
import { GoDeviceMobile as Phone} from 'react-icons/go'
import { Icon } from '@chakra-ui/react'
import React from 'react'

interface Props{
  device: DeviceType
}

const DeviceIcons = (props: Props) => {
  const iconized = (device: DeviceType) =>{
      switch (device){
      case DeviceType.Browser:
        return Browser 
      case DeviceType.IoT:
        return IoT 
      case DeviceType.Phone:
        return Phone 
      case DeviceType.Tablet:
        return Tablet 
      case DeviceType.Desktop:
        return Desktop
      default:
        return Other
    }
  } 
  return(<Icon as={iconized(props.device)} />)
}

export default DeviceIcons