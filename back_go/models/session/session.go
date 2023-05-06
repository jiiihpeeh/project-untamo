package session

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Session struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	UserId  string             `bson:"user_id,omitempty"`
	Token   string             `bson:"token,omitempty"`
	WsToken string             `bson:"ws_token,omitempty"`
	Time    int64              `bson:"time,omitempty"`
}
