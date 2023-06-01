import { IconType } from 'react-icons'
import { Icon } from '@chakra-ui/react'
import { GoBrowser as Browser } from 'react-icons/go'
import { MdComputer as Desktop, MdOutlineDevicesOther as Other, MdDeviceUnknown as IoT } from 'react-icons/md'
import { FiTablet as Tablet } from 'react-icons/fi'
import { GoDeviceMobile as Phone } from 'react-icons/go'
import React from 'react'
import { DeviceType } from '../../type'

interface Props {
  device: DeviceType
}

const deviceIcons: Record<DeviceType, IconType> = {
  [DeviceType.Browser]: Browser,
  [DeviceType.IoT]: IoT,
  [DeviceType.Phone]: Phone,
  [DeviceType.Tablet]: Tablet,
  [DeviceType.Desktop]: Desktop,
  [DeviceType.Other]: Other,
}

function DeviceIcons(props: Props) {
  const IconComponent = deviceIcons[props.device] || Other

  return <Icon as={IconComponent} />
}

export default DeviceIcons