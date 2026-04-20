package timer

import (
	"encoding/json"

	"github.com/oklog/ulid"
)

type Timer struct {
	ID      ulid.ULID `json:"id"`
	Title   string    `json:"title"`
	Laps    []uint64  `json:"laps"`
	User    string    `json:"user"`
	Created int64     `json:"created"`
}

type TimerOut struct {
	ID      string   `json:"id"`
	Title   string   `json:"title"`
	Laps    []uint64 `json:"laps"`
	Created int64    `json:"created"`
}

func (t *Timer) ToTimerOut() TimerOut {
	if t.Laps == nil {
		t.Laps = []uint64{}
	}
	return TimerOut{
		ID:      t.ID.String(),
		Title:   t.Title,
		Laps:    t.Laps,
		Created: t.Created,
	}
}

func TimerOutToTimer(out TimerOut, userId string) *Timer {
	parsed, _ := ulid.Parse(out.ID)
	return &Timer{
		ID:      parsed,
		Title:   out.Title,
		Laps:    out.Laps,
		User:    userId,
		Created: out.Created,
	}
}

type TimerSQL struct {
	ID      ulid.ULID `json:"id"`
	Title   string    `json:"title"`
	Laps    string    `json:"laps"`
	User    string    `json:"user"`
	Created int64     `json:"created"`
}

func (t *Timer) ToSQLForm() TimerSQL {
	lapsJson, _ := json.Marshal(t.Laps)
	return TimerSQL{
		ID:      t.ID,
		Title:   t.Title,
		Laps:    string(lapsJson),
		User:    t.User,
		Created: t.Created,
	}
}

func (t *TimerSQL) ToTimer() *Timer {
	var laps []uint64
	json.Unmarshal([]byte(t.Laps), &laps)
	return &Timer{
		ID:      t.ID,
		Title:   t.Title,
		Laps:    laps,
		User:    t.User,
		Created: t.Created,
	}
}
