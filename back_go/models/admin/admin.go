package admin

import "go.mongodb.org/mongo-driver/bson/primitive"

type Admin struct {
	MongoID  primitive.ObjectID `bson:"_id,omitempty" json:"-"`
	SQLiteID string             `json:"id"`
	Token    string             `bson:"token,omitempty"`
	UserId   string             `bson:"user_id,omitempty"`
	Time     int64              `bson:"time,omitempty"`
}

type AdminLogIn struct {
	Password string `json:"password"`
}

type AdminData struct {
	AdminToken string `json:"adminToken"`
	Time       int64  `json:"time"`
}

type AdminRequest struct {
	Active bool `json:"active"`
	Admin  bool `json:"admin"`
}
