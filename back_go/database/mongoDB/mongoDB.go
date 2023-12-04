package mongoDB

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"untamo_server.zzz/models/admin"
	"untamo_server.zzz/models/alarm"
	"untamo_server.zzz/models/device"
	"untamo_server.zzz/models/email"
	"untamo_server.zzz/models/qr"
	"untamo_server.zzz/models/session"
	"untamo_server.zzz/models/user"
	"untamo_server.zzz/utils/id"
)

const (
	//MONGODB_URI = "mongodb://root:example@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.5.4"
	DB_NAME     = "Untamo"
	USERCOLL    = "users"
	SESSIONCOLL = "sessions"
	QRCOLL      = "qr"
	ALARMCOLL   = "alarms"
	DEVICECOLL  = "devices"
	ADMINCOLL   = "admins"
	EMAILCOLL   = "emails"
	WEBCOLORS   = "webcolors"
)

type MongoDB struct {
	// Include any necessary fields for the MongoDB adapter.
	// For example, the MongoDB client or collection.
	connection *mongo.Client
}

// generate indexes for collections
func (m *MongoDB) GenerateIndexes() {
	//generate indexes for users
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	//generate index for email
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"email": 1, "_id": 1},
		Options: options.Index().SetUnique(true),
	})

	//switch to sessions
	collection = m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	//generate index for token
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"token": 1},
		Options: options.Index().SetUnique(true),
	})
	//generate index for ws_token
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"ws_token": 1},
		Options: options.Index().SetUnique(true),
	})
	//switch to alarms
	collection = m.connection.Database(DB_NAME).Collection(ALARMCOLL)
	//generate index for user and id
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"user": 1},
		Options: options.Index().SetUnique(false),
	})
	//generate index for alarm's devices
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"devices": 1},
		Options: options.Index().SetUnique(false),
	})
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"_id": 1},
		Options: options.Index().SetUnique(true),
	})
	//switch to devices
	collection = m.connection.Database(DB_NAME).Collection(DEVICECOLL)
	//generate index for user and id
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"user": 1},
		Options: options.Index().SetUnique(false),
	})
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"_id": 1},
		Options: options.Index().SetUnique(true),
	})
	//collection for web colors
	collection = m.connection.Database(DB_NAME).Collection(WEBCOLORS)
	//generate index for user and id
	collection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"user": 1},
		Options: options.Index().SetUnique(true),
	})
}

func (m *MongoDB) Connect(uri string) interface{} {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
	if err != nil {
		panic(err)
	}
	m.connection = client
	go m.GenerateIndexes()
	m.connection = client
	return *m
}

func (m *MongoDB) Disconnect() error {
	return m.connection.Disconnect(context.Background())
}

func GetTokenFromHeader(req *http.Request) string {
	token := req.Header.Get("token")
	return token
}

func (m *MongoDB) GetSessionFromToken(token string) (*session.Session, *user.User) {
	session := &session.Session{}
	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	err := collection.FindOne(context.Background(), bson.M{"token": token}).Decode(&session)
	if err != nil {
		return nil, nil
	}
	uID := id.IdFromString(session.UserId)
	if err != nil {
		return nil, nil
	}

	userInSession := m.GetUserFromID(uID.Hex())
	//fmt.Println("User in session: ", userInSession)
	if userInSession == nil {
		return nil, nil
	}
	//check if user is active
	if !userInSession.Active {
		//DeleteSession(token, client)
		return nil, nil
	}
	return session, userInSession
}

func (m *MongoDB) GetSessionFromTokenActivate(token string) (*session.Session, *user.User) {
	session := &session.Session{}
	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	err := collection.FindOne(context.Background(), bson.M{"token": token}).Decode(&session)
	//fmt.Println("Session check: ", session, token)
	if err != nil {
		return nil, nil
	}
	uID := id.IdFromString(session.UserId)

	userInSession := m.GetUserFromID(uID.Hex())
	//fmt.Println("User in session: ", userInSession)
	if userInSession == nil {
		return nil, nil
	}
	//fmt.Println("User in session: ", userInSession)
	return session, userInSession
}

func (m *MongoDB) DeleteSession(token string) bool {
	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	res, err := collection.DeleteOne(context.Background(), bson.M{"token": token})
	if err != nil {
		return false
	}
	if res.DeletedCount == 0 {
		return false
	}
	return true
}

func (m *MongoDB) GetSession(token string) (*session.Session, *user.User) {
	session := &session.Session{}
	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	err := collection.FindOne(context.Background(), bson.M{"token": token}).Decode(&session)
	//fmt.Println("Session check: ", session, token)
	//fmt.Println("Session check error: ", err)
	if err != nil {
		m.DeleteSession(token)
		return nil, nil
	}
	//fmt.Println("Session check: ", session, token)

	if session.Time < time.Now().UnixMilli() {
		m.DeleteSession(token)
		return nil, nil
	}
	uID := id.IdFromString(session.UserId)

	user := m.GetUserFromID(uID.Hex())
	//fmt.Println("User check: ", user)
	if user == nil {
		m.DeleteSession(token)
		return nil, nil
	}
	//check if user is active
	if !user.Active {
		//DeleteSession(token, client)
		return nil, nil
	}

	return session, user
}
func (m *MongoDB) GetSessionFromHeader(req *http.Request) (*session.Session, *user.User) {
	token := GetTokenFromHeader(req)
	//fmt.Println("Token: ", token)
	return m.GetSession(token)
}

func (m *MongoDB) GetUserFromSession(session *session.Session) *user.User {
	user := &user.User{}
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	err := collection.FindOne(context.Background(), bson.M{"_id": session.UserId}).Decode(&user)
	if err != nil {
		return nil
	}
	return user
}

func (m *MongoDB) GetUserAlarms(userID string) []*alarm.Alarm {
	alarms := []*alarm.Alarm{}
	collection := m.connection.Database(DB_NAME).Collection(ALARMCOLL)
	cursor, err := collection.Find(context.Background(), bson.M{"user": userID})
	if err != nil {
		return nil
	}
	for cursor.Next(context.Background()) {
		alarm := &alarm.Alarm{}
		err := cursor.Decode(&alarm)
		if err != nil {
			go m.DeleteAlarm(alarm.MongoID.Hex(), userID)
			continue
		}
		alarms = append(alarms, alarm)
	}
	return alarms
}

func (m *MongoDB) GetDevices(userID string) []*device.Device {
	devices := []*device.Device{}
	collection := m.connection.Database(DB_NAME).Collection(DEVICECOLL)
	cursor, err := collection.Find(context.Background(), bson.M{"user": userID})
	if err != nil {
		return nil
	}
	for cursor.Next(context.Background()) {
		device := &device.Device{}
		err := cursor.Decode(&device)
		if err != nil {
			go m.DeleteDevice(device.MongoID.Hex(), userID)
			continue
		}
		devices = append(devices, device)
	}
	return devices
}

func (m *MongoDB) AddAlarm(alarm *alarm.Alarm) (string, error) {
	collection := m.connection.Database(DB_NAME).Collection(ALARMCOLL)
	//insert alarm and get id

	insert, err := collection.InsertOne(context.Background(), alarm)
	if err != nil {
		//fmt.Println("Error: ", err)
	}
	insertedID := insert.InsertedID.(primitive.ObjectID)
	return insertedID.Hex(), err
}

func (m *MongoDB) EditAlarm(alarm *alarm.Alarm) bool {
	collection := m.connection.Database(DB_NAME).Collection(ALARMCOLL)
	//replace alarm by alarm id and user id
	_, err := collection.ReplaceOne(context.Background(), bson.M{"_id": alarm.MongoID, "user": alarm.User}, alarm)

	return err == nil
}

func (m *MongoDB) EditDevice(device *device.Device) bool {
	collection := m.connection.Database(DB_NAME).Collection(DEVICECOLL)
	//_, err := collection.UpdateOne(context.Background(), bson.M{"_id": device.ID, "user": device.User}, bson.M{"$set": device})
	//replace device
	_, err := collection.ReplaceOne(context.Background(), bson.M{"_id": device.MongoID, "user": device.User}, device)
	return err == nil
}

func (m *MongoDB) DeleteAlarm(alarmID string, userID string) bool {
	//convert alarmID to primitive.ObjectID
	alarmIDObj := id.IdFromString(alarmID)

	collection := m.connection.Database(DB_NAME).Collection(ALARMCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"_id": alarmIDObj, "user": userID})
	return err == nil
}

func (m *MongoDB) DeleteDevice(deviceID string, userID string) bool {
	//convert deviceID to primitive.ObjectID
	deviceIDObj := id.IdFromString(deviceID)
	collection := m.connection.Database(DB_NAME).Collection(DEVICECOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"_id": deviceID, "user": deviceIDObj})
	return err == nil
}

func (m *MongoDB) GetUserFromEmail(email string) *user.User {
	user := &user.User{}
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	err := collection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		fmt.Println("Error: ", err)
		return nil
	}
	return user
}

func (m *MongoDB) AddSession(session *session.Session) (string, error) {
	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	//insert session and get id
	insert, err := collection.InsertOne(context.Background(), session)
	if err != nil {
		//fmt.Println("Error: ", err)
	}
	insertedID := insert.InsertedID.(primitive.ObjectID)
	return insertedID.Hex(), err
}

func (m *MongoDB) AddDevice(device *device.Device) (string, error) {
	collection := m.connection.Database(DB_NAME).Collection(DEVICECOLL)
	//insert device and get id
	insert, err := collection.InsertOne(context.Background(), device)
	if err != nil {
		//fmt.Println("Error: ", err)
	}
	insertedID := insert.InsertedID.(primitive.ObjectID)
	return insertedID.Hex(), err
}

func (m *MongoDB) AddQr(qr *qr.QR) bool {
	m.RemoveExpiredQr()
	//fmt.Println("Adding qr: ", qr)
	collection := m.connection.Database(DB_NAME).Collection(QRCOLL)
	//insert qr and expire it after 5 minutes
	_, err := collection.InsertOne(context.Background(), qr)
	return err == nil
}

func (m *MongoDB) DeleteQr(token string) bool {
	collection := m.connection.Database(DB_NAME).Collection(QRCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"qr_token": token})
	return err == nil
}

func (m *MongoDB) GetQrData(token string) *qr.QR {
	qr := &qr.QR{}
	collection := m.connection.Database(DB_NAME).Collection(QRCOLL)
	err := collection.FindOne(context.Background(), bson.M{"qr_token": token}).Decode(&qr)
	if err != nil {
		return nil
	}
	//check if qr is expired
	if qr.Time < time.Now().UnixMilli() {
		go m.DeleteQr(token)
		return nil
	}
	return qr
}

func (m *MongoDB) GetUserFromID(userID string) *user.User {
	//convert userID to primitive.ObjectID
	userIDObj := id.IdFromString(userID)

	user := &user.User{}
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	err := collection.FindOne(context.Background(), bson.M{"_id": userIDObj}).Decode(&user)
	//fmt.Println("User :  __ ", user, userID)
	if err != nil {
		return nil
	}
	return user
}

func (m *MongoDB) GetUserFromActivation(email string, activate string) *user.User {
	user := &user.User{}
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	err := collection.FindOne(context.Background(), bson.M{"email": email, "activate": activate}).Decode(&user)
	if err != nil {
		return nil
	}
	return user
}

func (m *MongoDB) RemoveExpiredQr() bool {
	collection := m.connection.Database(DB_NAME).Collection(QRCOLL)
	_, err := collection.DeleteMany(context.Background(), bson.M{"time": bson.M{"$lt": time.Now().UnixMilli()}})
	return err == nil
}

func (m *MongoDB) AddAdminSession(admin *admin.Admin) bool {
	collection := m.connection.Database(DB_NAME).Collection(ADMINCOLL)
	_, err := collection.InsertOne(context.Background(), admin)
	return err == nil
}

func (m *MongoDB) DeleteAdminSession(token string) bool {
	collection := m.connection.Database(DB_NAME).Collection(ADMINCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"token": token})
	return err == nil
}

func (m *MongoDB) GetAdminSession(token string, user_admin user.User) *admin.Admin {
	admin := &admin.Admin{}
	collection := m.connection.Database(DB_NAME).Collection(ADMINCOLL)
	err := collection.FindOne(context.Background(), bson.M{"token": token}).Decode(&admin)
	if err != nil {
		return nil
	}
	//check if admin session is expired
	if admin.Time < time.Now().UnixMilli() {
		go m.DeleteAdminSession(token)
		return nil
	}
	if !user_admin.Active || !user_admin.Admin {
		go m.DeleteAdminSession(token)
		return nil
	}
	return admin
}

func (m *MongoDB) GetAdminSessionFromHeader(req *http.Request) (*admin.Admin, *user.User) {
	token := GetTokenFromHeader(req)
	//get AdminToken from header json
	adminToken := req.Header.Get("adminToken")
	//get session
	session, user := m.GetSession(token)
	//if session is not found return nil
	//fmt.Println("Session: ", session, "User: ", user)

	if session == nil {
		return nil, nil
	}
	//get admin session
	adminSession := m.GetAdminSession(adminToken, *user)
	//if admin session is not found return nil
	if adminSession == nil {
		return nil, nil
	}
	return adminSession, user
}

func (m *MongoDB) GetUsers() []*user.User {
	users := []*user.User{}
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil
	}
	for cursor.Next(context.Background()) {
		user := &user.User{}
		err := cursor.Decode(&user)
		if err != nil {
			return nil
		}
		users = append(users, user)
	}
	return users
}

func (m *MongoDB) UpdateUser(user *user.User) bool {
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	// replace user
	_, err := collection.ReplaceOne(context.Background(), bson.M{"_id": user.MongoID}, user)
	//_, err := collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{"$set": user})
	return err == nil
}

func (m *MongoDB) DeleteUserSessions(userID string) bool {
	//convert userID to primitive.ObjectID
	userIDObj := id.IdFromString(userID)

	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	_, err := collection.DeleteMany(context.Background(), bson.M{"user_id": userIDObj})
	return err == nil
}

func (m *MongoDB) DeleteUser(userID string) bool {
	//convert userID to primitive.ObjectID
	userIDObj := id.IdFromString(userID)

	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"_id": userIDObj})
	return err == nil
}

func (m *MongoDB) UpdateSession(session *session.Session) bool {
	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	//replace session by session id and user id
	_, err := collection.ReplaceOne(context.Background(), bson.M{"_id": session.MongoID, "user_id": session.UserId}, session)
	return err == nil
}

// count number of users
func (m *MongoDB) CountUsers() int64 {
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err != nil {
		return 0
	}
	return count
}

// add user to db
func (m *MongoDB) AddUser(user *user.User) (string, error) {
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	//insert user and get id
	insert, err := collection.InsertOne(context.Background(), user)
	if err != nil {
		//fmt.Println("Error: ", err)
	}
	insertedID := insert.InsertedID.(primitive.ObjectID)
	return insertedID.Hex(), err
}

// check if email is already in use
func (m *MongoDB) CheckEmail(email string) bool {
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	count, err := collection.CountDocuments(context.Background(), bson.M{"email": email})
	if err != nil {
		return false
	}
	return count > 0
}

//get session and user  from wsToken

func (m *MongoDB) GetUserAndSessionFromWsToken(wsToken string) (*session.Session, *user.User) {
	session := &session.Session{}
	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	err := collection.FindOne(context.Background(), bson.M{"ws_token": wsToken}).Decode(&session)
	if err != nil {
		return nil, nil
	}
	uID := id.IdFromString(session.UserId)

	user := m.GetUserFromID(uID.Hex())
	if user == nil {
		return nil, nil
	}
	return session, user
}

func (m *MongoDB) GetOwnerID() (string, error) {
	user := &user.User{}
	collection := m.connection.Database(DB_NAME).Collection(USERCOLL)
	err := collection.FindOne(context.Background(), bson.M{"owner": true}).Decode(&user)
	if err != nil {
		return "", err
	}
	return user.MongoID.Hex(), nil
}

func (m *MongoDB) StoreEmail(mail email.Email) bool {
	collection := m.connection.Database(DB_NAME).Collection(EMAILCOLL)
	_, err := collection.InsertOne(context.Background(), mail)
	return err == nil
}

func (m *MongoDB) DeleteEmail(userID string) bool {
	userIDObj := id.IdFromString(userID)

	collection := m.connection.Database(DB_NAME).Collection(EMAILCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"_id": userIDObj})
	return err == nil
}

func (m *MongoDB) GetEmails() []*email.Email {
	emails := []*email.Email{}
	collection := m.connection.Database(DB_NAME).Collection(EMAILCOLL)
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil
	}
	for cursor.Next(context.Background()) {
		email := &email.Email{}
		err := cursor.Decode(&email)
		if err != nil {
			return nil
		}
		emails = append(emails, email)
	}
	return emails
}

func (m *MongoDB) RemoveOldSessions() bool {
	collection := m.connection.Database(DB_NAME).Collection(SESSIONCOLL)
	_, err := collection.DeleteMany(context.Background(), bson.M{"time": bson.M{"$lt": time.Now().UnixMilli()}})
	return err == nil
}

func (m *MongoDB) RemoveAlarmsWithNoDevices() bool {
	//get slice of all deviceIDs
	deviceIDs := []string{}
	collection := m.connection.Database(DB_NAME).Collection(DEVICECOLL)
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return false
	}
	for cursor.Next(context.Background()) {
		device := &device.Device{}
		err := cursor.Decode(&device)
		if err != nil {
			return false
		}
		deviceIDs = append(deviceIDs, device.MongoID.Hex())
	}
	//check that alarm has at least one device
	collection = m.connection.Database(DB_NAME).Collection(ALARMCOLL)
	_, err = collection.DeleteMany(context.Background(), bson.M{"devices": bson.M{"$nin": deviceIDs}})

	return err == nil
}

type WebColorsUser struct {
	User   primitive.ObjectID `bson:"user"`
	Colors string             `bson:"colors"`
}

func (m *MongoDB) AddWebColors(userIn *user.User, webColors string) bool {
	collection := m.connection.Database(DB_NAME).Collection(WEBCOLORS)
	//add user id to webColors
	insert := WebColorsUser{
		User:   userIn.MongoID,
		Colors: webColors,
	}
	//insert or replace webColors
	_, err := collection.ReplaceOne(context.Background(), bson.M{"user": userIn.MongoID}, insert)
	return err == nil
}

func (m *MongoDB) GetWebColors(userIn *user.User) string {
	webColorsUser := &WebColorsUser{}
	collection := m.connection.Database(DB_NAME).Collection(WEBCOLORS)
	err := collection.FindOne(context.Background(), bson.M{"user": userIn.MongoID}).Decode(&webColorsUser)
	if err != nil {
		return ""
	}
	return webColorsUser.Colors
}

// AddWebColors(user *user.User, webColors *user.WebColors) bool
// GetWebColors(user *user.User) *user.WebColors
