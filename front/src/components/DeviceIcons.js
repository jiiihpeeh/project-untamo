import { GoBrowser as Browser } from 'react-icons/go';
import { GrPersonalComputer as Desktop } from 'react-icons/gr';
import { FiTablet as Tablet } from 'react-icons/fi';
import {MdSmartphone as Phone, MdDeviceUnknown as Other, MdOutlineDevicesOther as IoT } from 'react-icons/md';

const deviceIcons = (device) => {
  switch (device){
    case 'Browser':
      return Browser;
    case 'IoT':
      return IoT;
    case 'Phone':
      return Phone;
    case 'Tablet':
      return Tablet;
    case 'Desktop':
      return Desktop;
    default:
      return Other;
  }
}

export default deviceIcons;