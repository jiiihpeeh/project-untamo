package session

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Session struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	UserId  string             `bson:"user_id,"`
	Token   string             `bson:"token"`
	WsToken string             `bson:"ws_token"`
	Time    int64              `bson:"time"`
	WsPair  string             `bson:"ws_pair"`
}
