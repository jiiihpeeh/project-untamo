package alarm

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"untamo_server.zzz/utils/id"
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
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Occurrence  string             `bson:"occurrence,omitempty"`
	Time        string             `bson:"time,omitempty"`
	Weekdays    []string           `bson:"weekdays,omitempty"`
	Date        string             `bson:"date,omitempty"`
	Label       string             `bson:"label,omitempty"`
	Devices     []string           `bson:"devices"`
	Snooze      []int64            `bson:"snooze"`
	Tune        string             `bson:"tune,omitempty"`
	Active      bool               `bson:"active"`
	User        string             `bson:"user"`
	Modified    int64              `bson:"modified,omitempty"`
	Fingerprint string             `bson:"fingerprint,omitempty"`
	CloseTask   bool               `bson:"close_task"`
	Offline     bool               `bson:"offline,omitempty"`
}

// allow only enum values in Weekdays
func (a *Alarm) SetWeekdays(weekdays []string) {
	// make unique by converting  array to set to array
	set := make(map[string]bool)
	for _, weekday := range a.Weekdays {
		set[weekday] = true
	}
	a.Weekdays = []string{}
	for key := range set {
		a.Weekdays = append(a.Weekdays, key)
	}
	for _, weekday := range weekdays {
		switch weekday {
		case Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday:
			a.Weekdays = append(a.Weekdays, weekday)
		}
	}
}

// make unique by converting  array to set to array
func (a *Alarm) SetDevices(devices []string) {
	set := make(map[string]bool)
	for _, device := range devices {
		set[device] = true
	}
	for key, _ := range set {
		a.Devices = append(a.Devices, key)
	}
}

type AlarmOut struct {
	ID          string   `json:"id"`
	Occurrence  string   `json:"occurrence"`
	Time        string   `json:"time"`
	Weekdays    []string `json:"weekdays"`
	Date        string   `json:"date"`
	Label       string   `json:"label"`
	Devices     []string `json:"devices"`
	Snooze      []int64  `json:"snooze"`
	Tune        string   `json:"tune"`
	Active      bool     `json:"active"`
	Modified    int64    `json:"modified"`
	Fingerprint string   `json:"fingerprint"`
	CloseTask   bool     `json:"closeTask"`
}

// convert Alarm to AlarmOutput
func (a *Alarm) ToAlarmOut() AlarmOut {
	//check  a.snooze is not nil
	if a.Snooze == nil {
		a.Snooze = []int64{}
	}
	//same for a.devices
	if a.Devices == nil {
		a.Devices = []string{}
	}
	//a.weekdays
	if a.Weekdays == nil {
		a.Weekdays = []string{}
	}
	return AlarmOut{
		ID:          a.ID.Hex(),
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

// convert AlarmOutput to Alarm ask user Id
func (a *AlarmOut) ToAlarm(userId string) Alarm {
	aID, _ := id.IdFromString(a.ID)
	return Alarm{
		ID:          aID,
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

func (a *AlarmOut) ToNewAlarm(userId string) Alarm {
	return Alarm{
		//ID:          uID,
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
