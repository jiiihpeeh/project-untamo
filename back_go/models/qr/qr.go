package qr

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type QR struct {
	MongoID  primitive.ObjectID `bson:"_id,omitempty" json:"-"`
	SQLiteID uint64             `json:"id"`
	User     string             `bson:"user,omitempty" json:"user"`
	QrToken  string             `bson:"qr_token,omitempty" json:"qrToken"`
	Time     int64              `bson:"time,omitempty" json:"time"`
}

type QRIn struct {
	QrToken string `json:"qrToken"`
}
