package qr

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type QR struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	User    string             `bson:"user,omitempty"`
	QrToken string             `bson:"qr_token,omitempty"`
	Time    int64              `bson:"time,omitempty"`
}

type QRIn struct {
	QrToken string `json:"qrToken"`
}
