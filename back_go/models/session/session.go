package session

import (
	"github.com/oklog/ulid"
)

type Session struct {
	ID      ulid.ULID `bson:"_id,omitempty" json:"-"`
	UserId  string    `bson:"user_id" json:"userId"`
	Token   string    `bson:"token" json:"token"`
	WsToken string    `bson:"ws_token" json:"wsToken" `
	Time    int64     `bson:"time" json:"time"`
	WsPair  string    `bson:"ws_pair" json:"wsPair"`
}
