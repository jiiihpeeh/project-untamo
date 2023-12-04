package database

import (
	"database/sql"
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"
	"untamo_server.zzz/models/admin"
	"untamo_server.zzz/models/alarm"
	"untamo_server.zzz/models/device"
	"untamo_server.zzz/models/email"
	"untamo_server.zzz/models/qr"
	"untamo_server.zzz/models/session"

	"untamo_server.zzz/models/user"
)

type DatabaseConnection struct {
	MongoDB  *mongo.Client
	SQLiteDB *sql.DB
}

type Database interface {
	Connect(uri string) interface{}
	Disconnect() error

	// Session
	AddSession(sessionStruct *session.Session) (string, error)
	DeleteSession(token string) bool
	GetSessionFromToken(token string) (*session.Session, *user.User)
	GetUserAndSessionFromWsToken(wsToken string) (*session.Session, *user.User)
	DeleteUserSessions(userId string) bool
	GetSessionFromHeader(header *http.Request) (*session.Session, *user.User)
	GetSession(token string) (*session.Session, *user.User)
	UpdateSession(sessionStruct *session.Session) bool
	GetSessionFromTokenActivate(token string) (*session.Session, *user.User)
	GetAdminSessionFromHeader(header *http.Request) (*admin.Admin, *user.User)
	DeleteAdminSession(token string) bool
	AddAdminSession(adminStruct *admin.Admin) bool
	// User
	AddUser(userStruct *user.User) (string, error)

	GetUserFromEmail(email string) *user.User

	CountUsers() int64
	GetUsers() []*user.User
	UpdateUser(userStruct *user.User) bool
	GetUserFromSession(sessionStruct *session.Session) *user.User
	DeleteUser(id string) bool
	GetUserFromID(id string) *user.User
	GetOwnerID() (string, error)
	//RemoveUser(id string) bool

	//Alarms
	AddAlarm(alarm *alarm.Alarm) (string, error)
	EditAlarm(alarm *alarm.Alarm) bool
	DeleteAlarm(alarmId string, userId string) bool
	GetUserAlarms(userStruct string) []*alarm.Alarm

	//Device
	AddDevice(device *device.Device) (string, error)

	EditDevice(device *device.Device) bool
	DeleteDevice(deviceId string, userId string) bool

	GetDevices(userId string) []*device.Device

	//Qr
	AddQr(qr *qr.QR) bool
	DeleteQr(token string) bool
	GetQrData(token string) *qr.QR
	RemoveExpiredQr() bool

	//email
	CheckEmail(email string) bool
	StoreEmail(mail email.Email) bool
	DeleteEmail(userID string) bool
	GetEmails() []*email.Email

	RemoveAlarmsWithNoDevices() bool
	RemoveOldSessions() bool
	//misc
	AddWebColors(user *user.User, webColors string) bool
	GetWebColors(user *user.User) string
}
