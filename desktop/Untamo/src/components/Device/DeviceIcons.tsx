import { LucideIcon, Globe as Browser, Monitor as Desktop, LayoutGrid as Other, Cpu as IoT, Tablet, Smartphone as Phone } from '../../ui/icons'
import React from 'preact/compat'
import { DeviceType } from '../../type'

interface Props {
    device: DeviceType
}

const deviceIcons: Record<DeviceType, LucideIcon> = {
    [DeviceType.Browser]: Browser,
    [DeviceType.IoT]: IoT,
    [DeviceType.Phone]: Phone,
    [DeviceType.Tablet]: Tablet,
    [DeviceType.Desktop]: Desktop,
    [DeviceType.Other]: Other,
}

function DeviceIcons(props: Props) {
    const IconComponent = deviceIcons[props.device] || Other
    return <IconComponent size={16} className="inline align-middle" />
}

export default DeviceIcons
