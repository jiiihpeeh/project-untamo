package wsOut

const (
	AddAlarm     = "addAlarm"
	EditAlarm    = "editAlarm"
	DeleteAlarm  = "deleteAlarm"
	AddDevice    = "addDevice"
	EditDevice   = "editDevice"
	DeleteDevice = "deleteDevice"
	EditUser     = "editUser"
)

type WsOut struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}
