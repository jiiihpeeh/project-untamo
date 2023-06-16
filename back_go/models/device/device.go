package device

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"untamo_server.zzz/utils/dbConnection"
	"untamo_server.zzz/utils/id"
	"untamo_server.zzz/utils/tools"
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
	MongoID    primitive.ObjectID `bson:"_id,omitempty" json:"-"`
	SQLiteID   uint64             `json:"id"`
	DeviceName string             `bson:"device_name,omitempty" json:"deviceName"`
	DeviceType string             `bson:"device_type,omitempty" json:"deviceType"`
	User       string             `bson:"user,omitempty" json:"user"`
}

type DeviceOut struct {
	ID         string `json:"id"`
	DeviceName string `json:"deviceName"`
	DeviceType string `json:"type"`
}

// convert Device to DeviceOut
func (d *Device) ToDeviceOut() DeviceOut {
	//check if MongoID exists
	Id := ""
	if dbConnection.UseSQLite {
		Id = tools.IntToRadix(d.SQLiteID)
	} else {
		Id = d.MongoID.Hex()
	}

	return DeviceOut{
		ID:         Id,
		DeviceName: d.DeviceName,
		DeviceType: d.DeviceType,
	}
}

// convert DeviceOut to Device ask user Id
func (d *DeviceOut) ToDevice(userId string) Device {
	if dbConnection.UseSQLite {
		return Device{
			SQLiteID:   tools.RadixToInt(d.ID),
			DeviceName: d.DeviceName,
			DeviceType: d.DeviceType,
			User:       userId,
		}
	}

	return Device{
		MongoID:    id.IdFromString(d.ID),
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
