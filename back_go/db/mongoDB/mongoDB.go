package mongoDB

import (
	"context"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"untamo_server.zzz/models/admin"
	"untamo_server.zzz/models/alarm"
	"untamo_server.zzz/models/device"
	"untamo_server.zzz/models/qr"
	"untamo_server.zzz/models/session"
	"untamo_server.zzz/models/user"
	"untamo_server.zzz/utils/id"
)

const (
	MONGODB_URI = "mongodb://root:example@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.5.4"
	DB_NAME     = "Untamo"
	USERCOLL    = "users"
	SESSIONCOLL = "sessions"
	QRCOLL      = "qr"
	ALARMCOLL   = "alarms"
	DEVICECOLL  = "devices"
	ADMINCOLL   = "admins"
)

// async fn get_session_from_header(req: &HttpRequest, client: &web::Data<Client>) -> Option<Session> {
//     let token = match get_token_from_header(&req) {
//         Some(token) => token,
//         None => return None,
//     };
//     match get_session_from_token(&token, &client).await{
//         Some(session) => return Some(session),
//         None => return None,
//     };
// }

func Connect() *mongo.Client {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(MONGODB_URI))
	if err != nil {
		panic(err)
	}
	return client
}
func GetTokenFromHeader(req *http.Request) string {
	token := req.Header.Get("token")
	return token
}

func GetSessionFromToken(token string, client *mongo.Client) (*session.Session, *user.User) {
	session := &session.Session{}
	collection := client.Database(DB_NAME).Collection(SESSIONCOLL)
	err := collection.FindOne(context.Background(), bson.M{"token": token}).Decode(&session)
	if err != nil {
		return nil, nil
	}
	userInSession := GetUserFromID(id.IdFromString(session.UserId), client)
	//fmt.Println("User in session: ", userInSession)
	if userInSession == nil {
		return nil, nil
	}
	//check if user is active
	if !userInSession.Active {
		DeleteSession(token, client)
		return nil, nil
	}
	return session, userInSession
}

func DeleteSession(token string, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(SESSIONCOLL)
	res, err := collection.DeleteOne(context.Background(), bson.M{"token": token})
	if err != nil {
		return false
	}
	if res.DeletedCount == 0 {
		return false
	}
	return true
}

func GetSession(token string, client *mongo.Client) (*session.Session, *user.User) {
	session := &session.Session{}
	collection := client.Database(DB_NAME).Collection(SESSIONCOLL)
	err := collection.FindOne(context.Background(), bson.M{"token": token}).Decode(&session)
	//fmt.Println("Session check: ", session, token)
	//fmt.Println("Session check error: ", err)
	if err != nil {
		DeleteSession(token, client)
		return nil, nil
	}
	//fmt.Println("Session check: ", session, token)

	if session.Time < time.Now().UnixMilli() {
		DeleteSession(token, client)
		return nil, nil
	}
	user := GetUserFromID(id.IdFromString(session.UserId), client)
	//fmt.Println("User check: ", user)
	if user == nil {
		DeleteSession(token, client)
		return nil, nil
	}
	//check if user is active
	if !user.Active {
		DeleteSession(token, client)
		return nil, nil
	}

	return session, user
}
func GetSessionFromHeader(req *http.Request, client *mongo.Client) (*session.Session, *user.User) {
	token := GetTokenFromHeader(req)
	return GetSession(token, client)
}

func GetUserFromSession(session *session.Session, client *mongo.Client) *user.User {
	user := &user.User{}
	collection := client.Database(DB_NAME).Collection(USERCOLL)
	err := collection.FindOne(context.Background(), bson.M{"_id": session.UserId}).Decode(&user)
	if err != nil {
		return nil
	}
	return user
}

func GetUserAlarms(userID string, client *mongo.Client) []*alarm.Alarm {
	alarms := []*alarm.Alarm{}
	collection := client.Database(DB_NAME).Collection(ALARMCOLL)
	cursor, err := collection.Find(context.Background(), bson.M{"user": userID})
	if err != nil {
		return nil
	}
	for cursor.Next(context.Background()) {
		alarm := &alarm.Alarm{}
		err := cursor.Decode(&alarm)
		if err != nil {
			return nil
		}
		alarms = append(alarms, alarm)
	}
	return alarms
}

func GetDevices(userID string, client *mongo.Client) []*device.Device {
	devices := []*device.Device{}
	collection := client.Database(DB_NAME).Collection(DEVICECOLL)
	cursor, err := collection.Find(context.Background(), bson.M{"user": userID})
	if err != nil {
		return nil
	}
	for cursor.Next(context.Background()) {
		device := &device.Device{}
		err := cursor.Decode(&device)
		if err != nil {
			return nil
		}
		devices = append(devices, device)
	}
	return devices
}

func AddAlarm(alarm *alarm.Alarm, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(ALARMCOLL)
	_, err := collection.InsertOne(context.Background(), alarm)
	return err == nil
}

func EditAlarm(alarm *alarm.Alarm, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(ALARMCOLL)
	_, err := collection.UpdateOne(context.Background(), bson.M{"_id": alarm.ID, "user": alarm.User}, bson.M{"$set": alarm})
	return err == nil
}

func EditDevice(device *device.Device, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(DEVICECOLL)
	_, err := collection.UpdateOne(context.Background(), bson.M{"_id": device.ID, "user": device.User}, bson.M{"$set": device})
	return err == nil
}

func DeleteAlarm(alarmID primitive.ObjectID, userID string, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(ALARMCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"_id": alarmID, "user": userID})
	return err == nil
}

func DeleteDevice(deviceID primitive.ObjectID, userID string, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(DEVICECOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"_id": deviceID, "user": userID})
	return err == nil
}

func GetUserFromEmail(email string, client *mongo.Client) *user.User {
	user := &user.User{}
	collection := client.Database(DB_NAME).Collection(USERCOLL)
	err := collection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil
	}
	return user
}

func AddSession(session *session.Session, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(SESSIONCOLL)
	_, err := collection.InsertOne(context.Background(), session)
	return err == nil
}

func AddDevice(device *device.Device, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(DEVICECOLL)
	_, err := collection.InsertOne(context.Background(), device)
	return err == nil
}

func AddQr(qr *qr.QR, client *mongo.Client) bool {
	RemoveExpiredQr(client)
	collection := client.Database(DB_NAME).Collection(QRCOLL)
	//insert qr and expire it after 5 minutes
	_, err := collection.InsertOne(context.Background(), qr)
	return err == nil
}

func DeleteQr(token string, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(QRCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"qr_token": token})
	return err == nil
}

func GetQrData(token string, client *mongo.Client) *qr.QR {
	qr := &qr.QR{}
	collection := client.Database(DB_NAME).Collection(QRCOLL)
	err := collection.FindOne(context.Background(), bson.M{"qr_token": token}).Decode(&qr)
	if err != nil {
		return nil
	}
	//check if qr is expired
	if qr.Time < time.Now().UnixMilli() {
		DeleteQr(token, client)
		return nil
	}
	return qr
}

func GetUserFromID(userID primitive.ObjectID, client *mongo.Client) *user.User {
	user := &user.User{}
	collection := client.Database(DB_NAME).Collection(USERCOLL)
	err := collection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
	//fmt.Println("User :  __ ", user, userID)
	if err != nil {
		return nil
	}
	return user
}

func RemoveExpiredQr(client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(QRCOLL)
	_, err := collection.DeleteMany(context.Background(), bson.M{"time": bson.M{"$lt": time.Now().UnixMilli()}})
	return err == nil
}

func AddAdminSession(admin *admin.Admin, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(ADMINCOLL)
	_, err := collection.InsertOne(context.Background(), admin)
	return err == nil
}

func DeleteAdminSession(token string, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(ADMINCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"token": token})
	return err == nil
}

func GetAdminSession(token string, user_admin user.User, client *mongo.Client) *admin.Admin {
	admin := &admin.Admin{}
	collection := client.Database(DB_NAME).Collection(ADMINCOLL)
	err := collection.FindOne(context.Background(), bson.M{"token": token}).Decode(&admin)
	if err != nil {
		return nil
	}
	//check if admin session is expired
	if admin.Time < time.Now().UnixMilli() {
		DeleteAdminSession(token, client)
		return nil
	}
	if !user_admin.Active || !user_admin.Admin {
		DeleteAdminSession(token, client)
		return nil
	}
	return admin
}

func GetAdminSessionFromHeader(req *http.Request, client *mongo.Client) (*admin.Admin, *user.User) {
	token := GetTokenFromHeader(req)
	//get AdminToken from header json
	adminToken := req.Header.Get("adminToken")
	//get session
	session, user := GetSession(token, client)
	//if session is not found return nil
	//fmt.Println("Session: ", session, "User: ", user)

	if session == nil {
		return nil, nil
	}
	//get admin session
	adminSession := GetAdminSession(adminToken, *user, client)
	//if admin session is not found return nil
	if adminSession == nil {
		return nil, nil
	}
	return adminSession, user
}

func GetUsers(client *mongo.Client) []*user.User {
	users := []*user.User{}
	collection := client.Database(DB_NAME).Collection(USERCOLL)
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

func UpdateUser(user *user.User, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(USERCOLL)
	_, err := collection.UpdateOne(context.Background(), bson.M{"_id": user.ID}, bson.M{"$set": user})
	return err == nil
}

func DeleteUserSessions(userID primitive.ObjectID, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(SESSIONCOLL)
	_, err := collection.DeleteMany(context.Background(), bson.M{"user_id": userID})
	return err == nil
}

func RemoveUser(userID primitive.ObjectID, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(USERCOLL)
	_, err := collection.DeleteOne(context.Background(), bson.M{"_id": userID})
	return err == nil
}

func UpdateSession(session *session.Session, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(SESSIONCOLL)
	_, err := collection.UpdateOne(context.Background(), bson.M{"token": session.Token}, bson.M{"$set": session})
	return err == nil
}

// count number of users
func CountUsers(client *mongo.Client) int64 {
	collection := client.Database(DB_NAME).Collection(USERCOLL)
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err != nil {
		return 0
	}
	return count
}

// add user to db
func AddUser(user *user.User, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(USERCOLL)
	_, err := collection.InsertOne(context.Background(), user)
	return err == nil
}

// check if email is already in use
func CheckEmail(email string, client *mongo.Client) bool {
	collection := client.Database(DB_NAME).Collection(USERCOLL)
	count, err := collection.CountDocuments(context.Background(), bson.M{"email": email})
	if err != nil {
		return false
	}
	return count > 0
}
