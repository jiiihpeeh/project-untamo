package update

import (
	"untamo_server.zzz/models/alarm"
	"untamo_server.zzz/models/device"
	"untamo_server.zzz/models/user"
)

type Update struct {
	User    user.UserOut       `json:"user"`
	Alarms  []alarm.AlarmOut   `json:"alarms"`
	Devices []device.DeviceOut `json:"devices"`
}
