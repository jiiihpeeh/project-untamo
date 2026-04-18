package device

import (
	"github.com/oklog/ulid"
)

// device type enum
const (
	Browser = "Browser"
	Tablet  = "Tablet"
	Phone   = "Phone"
	Desktop = "Desktop"
	IoT     = "IoT"
	Other   = "Other"
)

type Device struct {
	ID         ulid.ULID `bson:"_id,omitempty" json:"-"`
	DeviceName string    `bson:"device_name,omitempty" json:"deviceName"`
	DeviceType string    `bson:"device_type,omitempty" json:"deviceType"`
	User       string    `bson:"user,omitempty" json:"user"`
}

type DeviceOut struct {
	ID         string `json:"id"`
	DeviceName string `json:"deviceName"`
	DeviceType string `json:"type"`
}

func (d *Device) ToDeviceOut() DeviceOut {
	return DeviceOut{
		ID:         d.ID.String(),
		DeviceName: d.DeviceName,
		DeviceType: d.DeviceType,
	}
}

func (d *DeviceOut) ToDevice(userId string) Device {
	parsed, _ := ulid.Parse(d.ID)
	return Device{
		ID:         parsed,
		DeviceName: d.DeviceName,
		DeviceType: d.DeviceType,
		User:       userId,
	}
}

func CheckDeviceType(deviceType string) string {
	switch deviceType {
	case Browser:
		return Browser
	case Tablet:
		return Tablet
	case Phone:
		return Phone
	case Desktop:
		return Desktop
	case IoT:
		return IoT
	default:
		return Other
	}
}
