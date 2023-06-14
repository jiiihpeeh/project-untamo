package session

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Session struct {
	MongoID  primitive.ObjectID `bson:"_id,omitempty" json:"-"`
	SQLiteID int64              `json:"id"`
	UserId   string             `bson:"user_id" json:"userId"`
	Token    string             `bson:"token" json:"token"`
	WsToken  string             `bson:"ws_token" json:"wsToken" `
	Time     int64              `bson:"time" json:"time"`
	WsPair   string             `bson:"ws_pair" json:"wsPair"`
}
