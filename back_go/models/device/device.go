package device

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"untamo_server.zzz/utils/id"
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
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	DeviceName string             `bson:"device_name,omitempty"`
	DeviceType string             `bson:"device_type,omitempty"`
	User       string             `bson:"user,omitempty"`
}

type DeviceOut struct {
	ID         string `json:"id"`
	DeviceName string `json:"deviceName"`
	DeviceType string `json:"type"`
}

// convert Device to DeviceOut
func (d *Device) ToDeviceOut() DeviceOut {
	return DeviceOut{
		ID:         d.ID.Hex(),
		DeviceName: d.DeviceName,
		DeviceType: d.DeviceType,
	}
}

// convert DeviceOut to Device ask user Id
func (d *DeviceOut) ToDevice(userId string) Device {
	return Device{
		ID:         id.IdFromString(d.ID),
		DeviceName: d.DeviceName,
		DeviceType: d.DeviceType,
		User:       userId,
	}
}

// check that device type is in enum if not return Other
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
