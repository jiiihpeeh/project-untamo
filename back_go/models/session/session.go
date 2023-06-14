package session

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Session struct {
	MongoID  primitive.ObjectID `bson:"_id,omitempty" json:"-"`
	SQLiteID int64              `json:"id"`
	UserId   string             `bson:"user_id" json:"user_id" clover:"UserId"`
	Token    string             `bson:"token" json:"token" clover:"Token"`
	WsToken  string             `bson:"ws_token" json:"ws_token" clover:"WsToken"`
	Time     int64              `bson:"time" json:"time" clover:"Time"`
	WsPair   string             `bson:"ws_pair" json:"ws_pair" clover:"WsPair"`
}
