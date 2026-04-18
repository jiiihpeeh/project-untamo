package alarm

import (
	"github.com/oklog/ulid"
	"github.com/thoas/go-funk"
	"untamo_server.zzz/utils/tools"
)

const (
	Monday    = "Monday"
	Tuesday   = "Tuesday"
	Wednesday = "Wednesday"
	Thursday  = "Thursday"
	Friday    = "Friday"
	Saturday  = "Saturday"
	Sunday    = "Sunday"
)

type Alarm struct {
	ID          ulid.ULID `bson:"_id,omitempty" json:"-"`
	Occurrence  string    `bson:"occurrence,omitempty" json:"occurrence"`
	Time        [2]uint8  `bson:"time,omitempty"`
	Weekdays    uint8     `bson:"weekdays,omitempty" json:"weekdays"`
	Date        [3]uint16 `bson:"date,omitempty"`
	Label       string    `bson:"label,omitempty" json:"label"`
	Devices     []string  `bson:"devices"`
	Snooze      []int64   `bson:"snooze"`
	Tune        string    `bson:"tune,omitempty" json:"tune"`
	Active      bool      `bson:"active" json:"active"`
	User        string    `bson:"user" json:"user"`
	Modified    int64     `bson:"modified,omitempty" json:"modified"`
	Fingerprint string    `bson:"fingerprint,omitempty" json:"fingerprint"`
	CloseTask   bool      `bson:"close_task" json:"closeTask"`
	Offline     bool      `bson:"offline,omitempty" json:"offline"`
}

type AlarmSQL struct {
	ID          ulid.ULID `json:"id"`
	Occurrence  string    `bson:"occurrence,omitempty" json:"occurrence"`
	Time        int16     `bson:"time,omitempty"`
	Weekdays    uint8     `bson:"weekdays,omitempty" json:"weekdays"`
	Date        int32     `bson:"date,omitempty"`
	Label       string    `bson:"label,omitempty" json:"label"`
	Devices     string    `bson:"devices"`
	Snooze      string    `bson:"snooze"`
	Tune        string    `bson:"tune,omitempty" json:"tune"`
	Active      bool      `bson:"active" json:"active"`
	User        string    `bson:"user" json:"user"`
	Modified    int64     `bson:"modified,omitempty" json:"modified"`
	Fingerprint string    `bson:"fingerprint,omitempty" json:"fingerprint"`
	CloseTask   bool      `bson:"close_task" json:"closeTask"`
	Offline     bool      `bson:"offline,omitempty" json:"offline"`
}

// make unique by converting  array to set to array
func (a *Alarm) SetDevices(devices []string) {
	uniqueDevices := funk.Uniq(devices).([]string)
	a.Devices = uniqueDevices
}

type AlarmOut struct {
	ID          string    `json:"id"`
	Occurrence  string    `json:"occurrence"`
	Time        [2]uint8  `json:"time"`
	Weekdays    uint8     `json:"weekdays"`
	Date        [3]uint16 `json:"date"`
	Label       string    `json:"label"`
	Devices     []string  `json:"devices"`
	Snooze      []int64   `json:"snooze"`
	Tune        string    `json:"tune"`
	Active      bool      `json:"active"`
	Modified    int64     `json:"modified"`
	Fingerprint string    `json:"fingerprint"`
	CloseTask   bool      `json:"closeTask"`
}

func (a *Alarm) ToSQLForm() AlarmSQL {
	return AlarmSQL{
		ID:          a.ID,
		Occurrence:  a.Occurrence,
		Time:        tools.TimeArrayToInteger(a.Time),
		Weekdays:    a.Weekdays,
		Date:        tools.DateArrayToInteger(a.Date),
		Label:       a.Label,
		Devices:     tools.DevicesArrayToString(a.Devices),
		Snooze:      tools.SnoozeArrayToString(a.Snooze),
		Tune:        a.Tune,
		Active:      a.Active,
		User:        a.User,
		Modified:    a.Modified,
		Fingerprint: a.Fingerprint,
		CloseTask:   a.CloseTask,
		Offline:     a.Offline,
	}
}

func (s *AlarmSQL) ToAlarm() Alarm {
	return Alarm{
		ID:          s.ID,
		Occurrence:  s.Occurrence,
		Time:        tools.IntegerToTimeArray(s.Time),
		Weekdays:    s.Weekdays,
		Date:        tools.IntegerToDateArray(s.Date),
		Label:       s.Label,
		Devices:     tools.StringToDevicesArray(s.Devices),
		Snooze:      tools.StringToSnoozeArray(s.Snooze),
		Tune:        s.Tune,
		Active:      s.Active,
		User:        s.User,
		Modified:    s.Modified,
		Fingerprint: s.Fingerprint,
		CloseTask:   s.CloseTask,
		Offline:     s.Offline,
	}
}

func (a *Alarm) ToAlarmOut() AlarmOut {
	if a.Snooze == nil {
		a.Snooze = []int64{}
	}

	if a.Devices == nil {
		a.Devices = []string{}
	}

	return AlarmOut{
		ID:          a.ID.String(),
		Occurrence:  a.Occurrence,
		Time:        a.Time,
		Weekdays:    a.Weekdays,
		Date:        a.Date,
		Label:       a.Label,
		Devices:     a.Devices,
		Snooze:      a.Snooze,
		Tune:        a.Tune,
		Active:      a.Active,
		Modified:    a.Modified,
		Fingerprint: a.Fingerprint,
		CloseTask:   a.CloseTask,
	}
}

func (a *AlarmOut) ToAlarm(userId string) Alarm {
	parsed, _ := ulid.Parse(a.ID)
	return Alarm{
		ID:          parsed,
		Occurrence:  a.Occurrence,
		Time:        a.Time,
		Weekdays:    a.Weekdays,
		Date:        a.Date,
		Label:       a.Label,
		Devices:     a.Devices,
		User:        userId,
		Snooze:      a.Snooze,
		Tune:        a.Tune,
		Active:      a.Active,
		Modified:    a.Modified,
		Fingerprint: a.Fingerprint,
		CloseTask:   a.CloseTask,
	}
}

func (a *AlarmOut) ToNewAlarm(userId string) Alarm {

	return Alarm{
		Occurrence:  a.Occurrence,
		Time:        a.Time,
		Weekdays:    a.Weekdays,
		Date:        a.Date,
		Label:       a.Label,
		Devices:     a.Devices,
		Snooze:      a.Snooze,
		Tune:        a.Tune,
		Active:      a.Active,
		User:        userId,
		Modified:    a.Modified,
		Fingerprint: a.Fingerprint,
		CloseTask:   a.CloseTask,
	}
}
