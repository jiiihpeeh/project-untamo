package sqliteDB

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	//_ "github.com/mattn/go-sqlite3"
	_ "github.com/glebarez/go-sqlite"
	"github.com/thoas/go-funk"
	"untamo_server.zzz/models/admin"
	"untamo_server.zzz/models/alarm"
	"untamo_server.zzz/models/device"
	"untamo_server.zzz/models/email"
	"untamo_server.zzz/models/qr"
	"untamo_server.zzz/models/session"
	"untamo_server.zzz/models/user"
	"untamo_server.zzz/utils/tools"
)

type SQLiteDB struct {
	connection *sql.DB
}

// create and index tables
func (s *SQLiteDB) CreateTables() {
	//create users table
	query := "CREATE TABLE IF NOT EXISTS users (ID INTEGER PRIMARY KEY AUTOINCREMENT, Email TEXT, FirstName TEXT, LastName TEXT, ScreenName TEXT, Admin INTEGER, Owner INTEGER, Active INTEGER, Password TEXT, Activate TEXT, Registered INTEGER, PasswordResetRequestTime INTEGER, PasswordResetToken TEXT)"
	s.connection.Exec(query)
	//index users table
	query = "CREATE UNIQUE INDEX IF NOT EXISTS email ON users (Email)"
	s.connection.Exec(query)

	//create sessions table
	query = "CREATE TABLE IF NOT EXISTS sessions (ID INTEGER PRIMARY KEY AUTOINCREMENT, UserId TEXT, Token TEXT, WsToken TEXT, Time INTEGER, WsPair TEXT)"
	s.connection.Exec(query)
	//index sessions table
	query = "CREATE UNIQUE INDEX IF NOT EXISTS token ON sessions (Token)"
	s.connection.Exec(query)
	query = "CREATE UNIQUE INDEX IF NOT EXISTS ws_token ON sessions (WsToken)"
	s.connection.Exec(query)

	//create alarms table
	query = "CREATE TABLE IF NOT EXISTS alarms (ID INTEGER PRIMARY KEY AUTOINCREMENT, Occurrence TEXT, Time TEXT, Weekdays TEXT, Date TEXT, Label TEXT, Devices TEXT, Snooze TEXT, Tune TEXT, Active INTEGER, User TEXT, Modified INTEGER, Fingerprint TEXT, CloseTask INTEGER, Offline INTEGER)"
	s.connection.Exec(query)
	//index alarms table
	query = "CREATE INDEX IF NOT EXISTS user ON alarms (User)"
	s.connection.Exec(query)

	//create devices table
	query = "CREATE TABLE IF NOT EXISTS devices (ID INTEGER PRIMARY KEY AUTOINCREMENT, DeviceName TEXT, DeviceType TEXT, User TEXT)"
	s.connection.Exec(query)

	//index devices table by user
	query = "CREATE INDEX IF NOT EXISTS user ON devices (User)"
	s.connection.Exec(query)

	//create admins table
	query = "CREATE TABLE IF NOT EXISTS admin (ID INTEGER PRIMARY KEY AUTOINCREMENT, Token TEXT, UserId TEXT, Time INTEGER)"
	s.connection.Exec(query)

	//create qr table
	query = "CREATE TABLE IF NOT EXISTS qr (ID INTEGER PRIMARY KEY AUTOINCREMENT, Token TEXT, User TEXT, Time INTEGER)"
	s.connection.Exec(query)

	//index qr table
	query = "CREATE UNIQUE INDEX IF NOT EXISTS token ON qr (Token)"

	//create email table
	query = "CREATE TABLE IF NOT EXISTS email (ID INTEGER PRIMARY KEY AUTOINCREMENT, Email TEXT, Subject TEXT, Message TEXT, Time INTEGER)"
	s.connection.Exec(query)

	//index email table
	query = "CREATE UNIQUE INDEX IF NOT EXISTS email ON email (Email)"
	s.connection.Exec(query)
}

func (s *SQLiteDB) Connect(file string) interface{} {
	//db, err := sql.Open("sqlite3", "./untamo.db")
	db, err := sql.Open("sqlite", file)
	if err != nil {
		panic(err)
	}
	db.SetMaxOpenConns(6)
	s.connection = db
	s.CreateTables()
	return *s
}

func (s *SQLiteDB) Disconnect() error {
	return s.connection.Close()
}

func (s *SQLiteDB) AddSession(session *session.Session) (string, error) {
	query := "INSERT INTO sessions (UserId, Token, WsToken, Time, WsPair) VALUES (?, ?, ?, ?, ?)"
	result, err := s.connection.Exec(query, session.UserId, session.Token, session.WsToken, session.Time, session.WsPair)
	if err != nil {
		//fmt.Println(err)
		return "", err
	}
	//commit
	//fmt.Println("Session added: ", session)

	id, _ := result.LastInsertId()
	//fmt.Println("Session added: ", id, result)
	return tools.IntToRadix(id), nil
}

func (s *SQLiteDB) DeleteUserSessions(id string) bool {
	query := "DELETE FROM sessions WHERE UserId = ?"
	_, err := s.connection.Exec(query, id)
	return err == nil
}

func GetTokenFromHeader(req *http.Request) string {
	token := req.Header.Get("token")
	return token
}

func (s *SQLiteDB) DeleteSession(token string) bool {
	query := "DELETE FROM sessions WHERE token = ?"
	_, err := s.connection.Exec(query, token)
	return err == nil
}

func (s *SQLiteDB) GetSession(token string) (*session.Session, *user.User) {
	//session := &session.Session{}
	query := "SELECT * FROM sessions WHERE token = ?"
	session := &session.Session{}
	row := s.connection.QueryRow(query, token)
	err := row.Scan(&session.SQLiteID, &session.UserId, &session.Token, &session.WsToken, &session.Time, &session.WsPair)
	if err != nil {
		s.DeleteSession(token)
		return nil, nil
	}
	//set session from row

	if session.Time < time.Now().UnixMilli() {
		s.DeleteSession(token)
		return nil, nil
	}

	user := s.GetUserFromID(session.UserId)
	//fmt.Println("User check: ", user)
	if user == nil {
		s.DeleteSession(token)
		return nil, nil
	}
	//check if user is active
	if !user.Active {
		//DeleteSession(token, client)
		return nil, nil
	}
	return session, user
}

func (s *SQLiteDB) GetSessionFromHeader(req *http.Request) (*session.Session, *user.User) {
	token := GetTokenFromHeader(req)
	return s.GetSession(token)
}

func (s *SQLiteDB) AddAlarm(alarm *alarm.Alarm) (string, error) {
	//convert to AlarmSQL
	aSql := alarm.ToSQLForm()

	// Add alarm to the database and get the inserted ID
	query := "INSERT INTO alarms (Occurrence, Time, Weekdays, Date, Label, Devices, Snooze, Tune, Active, User, Modified, Fingerprint, CloseTask, Offline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	//convert alarm.Time and alarm.Date to string
	result, err := s.connection.Exec(query, aSql.Occurrence, aSql.Time, aSql.Weekdays, aSql.Date, aSql.Label, aSql.Devices, aSql.Snooze, aSql.Tune, aSql.Active, aSql.User, aSql.Modified, aSql.Fingerprint, aSql.CloseTask, aSql.Offline)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	// Get the inserted ID
	id, _ := result.LastInsertId()
	return tools.IntToRadix(id), nil
}

func (s *SQLiteDB) GetAlarmByID(id string) *alarm.Alarm {
	// Get the alarm from the SQLite database based on alarm ID
	query := "SELECT * FROM alarms WHERE ID = ?"
	row := s.connection.QueryRow(query, tools.RadixToInt(id))

	// Create an alarm struct and fill it with the data from the SQLite database
	alarmSql := &alarm.AlarmSQL{}
	err := row.Scan(&alarmSql.SQLiteID, &alarmSql.Occurrence, &alarmSql.Time, &alarmSql.Weekdays, &alarmSql.Date, &alarmSql.Label, &alarmSql.Devices, &alarmSql.Snooze, &alarmSql.Tune, &alarmSql.Active, &alarmSql.User, &alarmSql.Modified, &alarmSql.Fingerprint, &alarmSql.CloseTask, &alarmSql.Offline)
	if err != nil {
		return nil
	}
	//convert to alarm
	alarm := alarmSql.ToAlarm()
	return &alarm
}

func (s *SQLiteDB) EditAlarm(alarm *alarm.Alarm) bool {
	// Check if the user field remains the same
	//convert to AlarmSQL
	alarmSql := alarm.ToSQLForm()
	user := alarm.User
	id := alarm.SQLiteID
	//edit alarm based on ID and user
	query := "UPDATE alarms SET Occurrence = ?, Time = ?, Weekdays = ?, Date = ?, Label = ?, Devices = ?, Snooze = ?, Tune = ?, Active = ?, User = ?, Modified = ?, Fingerprint = ?, CloseTask = ?, Offline = ? WHERE ID = ? AND User = ?"
	_, err := s.connection.Exec(query, alarmSql.Occurrence, alarmSql.Time, alarmSql.Weekdays, alarmSql.Date, alarmSql.Label, alarmSql.Devices, alarmSql.Snooze, alarmSql.Tune, alarmSql.Active, alarmSql.User, alarmSql.Modified, alarmSql.Fingerprint, alarmSql.CloseTask, alarmSql.Offline, id, user)
	return err == nil
}

func (s *SQLiteDB) DeleteAlarm(id string, userID string) bool {
	// Delete the alarm from the SQLite database based on alarm ID and user ID
	existingAlarm := s.GetAlarmByID(id)
	if existingAlarm == nil || existingAlarm.User != userID {
		return false
	}
	query := "DELETE FROM alarms WHERE ID = ? AND user = ?"
	_, err := s.connection.Exec(query, tools.RadixToInt(id), userID)

	return err == nil
}

func (s *SQLiteDB) GetUserAlarms(userID string) []*alarm.Alarm {
	// Get all the alarms from the SQLite database based on user ID
	query := "SELECT * FROM alarms WHERE user = ?"
	rows, err := s.connection.Query(query, userID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	// Create an alarm slice and fill it with the data from the SQLite database
	alarms := []*alarm.Alarm{}
	for rows.Next() {
		alarmSql := &alarm.AlarmSQL{}
		//convert time and date from json
		err := rows.Scan(&alarmSql.SQLiteID, &alarmSql.Occurrence, &alarmSql.Time, &alarmSql.Weekdays, &alarmSql.Date, &alarmSql.Label, &alarmSql.Devices, &alarmSql.Snooze, &alarmSql.Tune, &alarmSql.Active, &alarmSql.User, &alarmSql.Modified, &alarmSql.Fingerprint, &alarmSql.CloseTask, &alarmSql.Offline)
		if err != nil {
			return nil
		}
		alarm := alarmSql.ToAlarm()
		alarms = append(alarms, &alarm)
	}
	return alarms
}

func (s *SQLiteDB) GetSessionFromToken(token string) (*session.Session, *user.User) {
	// Get the session from the SQLite database based on token
	query := "SELECT * FROM sessions WHERE token = ?"
	row := s.connection.QueryRow(query, token)

	// Create a session struct and fill it with the data from the SQLite database
	session := &session.Session{}
	err := row.Scan(&session.SQLiteID, &session.UserId, &session.Token, &session.WsToken, &session.Time, &session.WsPair)
	if err != nil {
		//log.Println(err)
		return nil, nil
	}
	userInSession := s.GetUserFromID(session.UserId)
	if userInSession == nil {
		return nil, nil
	}

	return session, userInSession
}

func (s *SQLiteDB) AddUser(user *user.User) (string, error) {
	// Add user to the database and get the inserted ID
	query := "INSERT INTO users (Email, FirstName, LastName, ScreenName, Admin, Owner, Active, Password, Activate, Registered, PasswordResetRequestTime, PasswordResetToken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	result, err := s.connection.Exec(query, user.Email, user.FirstName, user.LastName, user.ScreenName, user.Admin, user.Owner, user.Active, user.Password, user.Activate, user.Registered, user.PasswordResetRequestTime, user.PasswordResetToken)

	if err != nil {
		//fmt.Println(err)
		return "", err
	}
	//// Get the inserted ID
	id, _ := result.LastInsertId()
	return tools.IntToRadix(id), nil
}

func (s *SQLiteDB) GetUserByID(id string) *user.User {
	// Get the user from the SQLite database based on user ID
	query := "SELECT * FROM users WHERE ID = ?"
	row := s.connection.QueryRow(query, tools.RadixToInt(id))

	// Create a user struct and fill it with the data from the SQLite database
	user := &user.User{}
	err := row.Scan(&user.SQLiteID, &user.Email, &user.FirstName, &user.LastName, &user.ScreenName, &user.Admin, &user.Owner, &user.Active, &user.Password, &user.Activate, &user.Registered, &user.PasswordResetRequestTime, &user.PasswordResetToken)
	if err != nil {
		return nil
	}
	return user
}

func (s *SQLiteDB) GetUserFromEmail(email string) *user.User {
	// Get the user from the SQLite database based on email
	query := "SELECT * FROM users WHERE email = ?"
	row := s.connection.QueryRow(query, email)

	// Create a user struct and fill it with the data from the SQLite database
	user := &user.User{}
	err := row.Scan(&user.SQLiteID, &user.Email, &user.FirstName, &user.LastName, &user.ScreenName, &user.Admin, &user.Owner, &user.Active, &user.Password, &user.Activate, &user.Registered, &user.PasswordResetRequestTime, &user.PasswordResetToken)
	if err != nil {
		return nil
	}
	return user
}

func (s *SQLiteDB) GetUserAndSessionFromWsToken(wsToken string) (*session.Session, *user.User) {
	// Get the session from the SQLite database based on websocket token
	query := "SELECT * FROM sessions WHERE wsToken = ?"
	row := s.connection.QueryRow(query, wsToken)
	//to session
	session := &session.Session{}
	err := row.Scan(&session.SQLiteID, &session.UserId, &session.Token, &session.WsToken, &session.Time, &session.WsPair)

	// Create a session struct and fill it with the data from the SQLite database
	if err != nil {
		return nil, nil
	}
	//to user
	user := &user.User{}
	query = "SELECT * FROM users WHERE ID = ?"
	row = s.connection.QueryRow(query, tools.RadixToInt(session.UserId))
	err = row.Scan(&user.SQLiteID, &user.Email, &user.FirstName, &user.LastName, &user.ScreenName, &user.Admin, &user.Owner, &user.Active, &user.Password, &user.Activate, &user.Registered, &user.PasswordResetRequestTime, &user.PasswordResetToken)
	if err != nil {
		return nil, nil
	}
	return session, user
}

func (s *SQLiteDB) DeleteSessionByToken(token string, user string) bool {
	query := "DELETE FROM sessions WHERE token = ? AND userID = ?"
	_, err := s.connection.Exec(query, token, user)
	return err == nil
}

func (s *SQLiteDB) GetUserFromSession(session *session.Session) *user.User {
	user := &user.User{}
	query := "SELECT * FROM users WHERE ID = ?"
	row := s.connection.QueryRow(query, tools.RadixToInt(session.UserId))
	err := row.Scan(&user.SQLiteID, &user.Email, &user.FirstName, &user.LastName, &user.ScreenName, &user.Admin, &user.Owner, &user.Active, &user.Password, &user.Activate, &user.Registered, &user.PasswordResetRequestTime, &user.PasswordResetToken)
	if err != nil {
		return nil
	}
	return user
}

func (s *SQLiteDB) UpdateSession(session *session.Session) bool {
	query := "UPDATE sessions SET UserId = ?, Token = ?, WsToken = ?, Time = ?, WsPair = ? WHERE ID = ?"
	_, err := s.connection.Exec(query, session.UserId, session.Token, session.WsToken, session.Time, session.WsPair, session.SQLiteID)
	return err == nil
}

func (s *SQLiteDB) GetSessionFromTokenActivate(token string) (*session.Session, *user.User) {
	query := "SELECT * FROM sessions WHERE token = ?"
	row := s.connection.QueryRow(query, token)

	session := &session.Session{}
	err := row.Scan(&session.SQLiteID, &session.UserId, &session.Token, &session.WsToken, &session.Time, &session.WsPair)
	if err != nil {
		return nil, nil
	}
	user := s.GetUserFromID(session.UserId)
	if user == nil {
		return nil, nil
	}
	return session, user
}

func (s *SQLiteDB) GetAdminSessionFromHeader(req *http.Request) (*admin.Admin, *user.User) {

	token := GetTokenFromHeader(req)
	_, user := s.GetSession(token)
	if user == nil || !user.Admin {
		return nil, nil
	}
	admin := &admin.Admin{}
	query := "SELECT * FROM admin WHERE userID = ?"
	row := s.connection.QueryRow(query, user.SQLiteID)
	err := row.Scan(&admin.SQLiteID, &admin.Token, &admin.UserId, &admin.Time)
	if err != nil {
		//log.Println(err)
		return nil, nil
	}
	return admin, user
}

func (s *SQLiteDB) GetUsers() []*user.User {
	query := "SELECT * FROM users"
	rows, err := s.connection.Query(query)
	if err != nil {
		return nil
	}
	defer rows.Close()

	users := []*user.User{}
	for rows.Next() {
		user := &user.User{}
		err := rows.Scan(&user.SQLiteID, &user.Email, &user.FirstName, &user.LastName, &user.ScreenName, &user.Admin, &user.Owner, &user.Active, &user.Password, &user.Activate, &user.Registered, &user.PasswordResetRequestTime, &user.PasswordResetToken)
		if err != nil {
			//log.Println(err)
			return nil
		}
		users = append(users, user)
	}
	//log.Println("Users: ", users)
	return users
}

func (s *SQLiteDB) DeleteAdminSession(token string) bool {
	query := "DELETE FROM sessions WHERE token = ?"
	_, err := s.connection.Exec(query, token)
	return err == nil
}

func (s *SQLiteDB) EditUser(user *user.User) bool {
	query := "UPDATE users SET Email = ?, FirstName = ?, LastName = ?, ScreenName = ?, Admin = ?, Owner = ?, Active = ?, Password = ?, Activate = ?, Registered = ?, PasswordResetRequestTime = ?, PasswordResetToken = ? WHERE ID = ?"
	_, err := s.connection.Exec(query, user.Email, user.FirstName, user.LastName, user.ScreenName, user.Admin, user.Owner, user.Active, user.Password, user.Activate, user.Registered, user.PasswordResetRequestTime, user.PasswordResetToken, user.SQLiteID)
	return err == nil
}

func (s *SQLiteDB) UpdateUser(user *user.User) bool {
	query := "UPDATE users SET Email = ?, FirstName = ?, LastName = ?, ScreenName = ?, Admin = ?, Owner = ?, Active = ?, Password = ?, Activate = ?, Registered = ?, PasswordResetRequestTime = ?, PasswordResetToken = ? WHERE ID = ?"
	_, err := s.connection.Exec(query, user.Email, user.FirstName, user.LastName, user.ScreenName, user.Admin, user.Owner, user.Active, user.Password, user.Activate, user.Registered, user.PasswordResetRequestTime, user.PasswordResetToken, user.SQLiteID)
	return err == nil
}

func (s *SQLiteDB) DeleteUser(id string) bool {
	query := "DELETE FROM users WHERE ID = ?"
	_, err := s.connection.Exec(query, tools.RadixToInt(id))

	//delete all sessions for user
	query = "DELETE FROM sessions WHERE userID = ?"
	go s.connection.Exec(query, id)
	//delete all alarms for user
	query = "DELETE FROM alarms WHERE user = ?"
	go s.connection.Exec(query, id)
	//delete all devices for user
	query = "DELETE FROM devices WHERE user = ?"
	go s.connection.Exec(query, id)

	return err == nil
}

func (s *SQLiteDB) GetDevices(userID string) []*device.Device {
	query := "SELECT * FROM devices WHERE user = ?"
	rows, err := s.connection.Query(query, userID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	devices := []*device.Device{}
	for rows.Next() {
		device := &device.Device{}
		err := rows.Scan(&device.SQLiteID, &device.DeviceName, &device.DeviceType, &device.User)
		if err != nil {
			return nil
		}
		devices = append(devices, device)
	}
	return devices
}

func (s *SQLiteDB) GetDeviceByID(id string) *device.Device {
	query := "SELECT * FROM devices WHERE ID = ?"
	row := s.connection.QueryRow(query, tools.RadixToInt(id))

	device := &device.Device{}
	err := row.Scan(&device.SQLiteID, &device.DeviceName, &device.DeviceType, &device.User)
	if err != nil {
		return nil
	}
	return device
}

func (s *SQLiteDB) EditDevice(device *device.Device) bool {
	id := device.SQLiteID
	user := device.User
	//log.Println("Edit device: ", device)
	query := "UPDATE devices SET DeviceName = ?, DeviceType = ?, User = ? WHERE ID = ? AND User = ?"
	_, err := s.connection.Exec(query, device.DeviceName, device.DeviceType, device.User, id, user)
	return err == nil
}

func (s *SQLiteDB) DeleteDevice(id string, userID string) bool {
	query := "DELETE FROM devices WHERE ID = ? AND user = ?"
	_, err := s.connection.Exec(query, tools.RadixToInt(id), userID)
	return err == nil
}

func (s *SQLiteDB) AddDevice(device *device.Device) (string, error) {
	query := "INSERT INTO devices (DeviceName, DeviceType, User) VALUES (?, ?, ?)"
	result, err := s.connection.Exec(query, device.DeviceName, device.DeviceType, device.User)
	if err != nil {
		return "", err
	}
	id, _ := result.LastInsertId()
	return tools.IntToRadix(id), nil
}

func (s *SQLiteDB) RemoveExpiredQr() bool {
	query := "DELETE FROM qr WHERE Time < ?"
	_, err := s.connection.Exec(query, time.Now().UnixMilli())
	return err == nil

}
func (s *SQLiteDB) AddQr(qr *qr.QR) bool {
	go s.RemoveExpiredQr()
	query := "INSERT INTO qr (User, Token, Time) VALUES (?, ?, ?)"
	_, err := s.connection.Exec(query, qr.User, qr.QrToken, qr.Time)
	return err == nil
}

func (s *SQLiteDB) DeleteQr(token string) bool {
	query := "DELETE FROM qr WHERE Token = ?"
	_, err := s.connection.Exec(query, token)
	return err == nil
}

func (s *SQLiteDB) GetQrData(token string) *qr.QR {
	query := "SELECT * FROM qr WHERE Token = ?"
	row := s.connection.QueryRow(query, token)

	qr := &qr.QR{}
	err := row.Scan(&qr.SQLiteID, &qr.User, &qr.QrToken, &qr.Time)
	if err != nil {
		return nil
	}
	//delete qr
	s.DeleteQr(token)
	return qr
}

func (s *SQLiteDB) GetUserFromID(id string) *user.User {
	query := "SELECT * FROM users WHERE ID = ?"
	row := s.connection.QueryRow(query, tools.RadixToInt(id))

	user := &user.User{}
	err := row.Scan(&user.SQLiteID, &user.Email, &user.FirstName, &user.LastName, &user.ScreenName, &user.Admin, &user.Owner, &user.Active, &user.Password, &user.Activate, &user.Registered, &user.PasswordResetRequestTime, &user.PasswordResetToken)
	if err != nil {
		return nil
	}
	return user
}

func (s *SQLiteDB) GetOwnerID() (string, error) {
	query := "SELECT ID FROM users WHERE Owner = 1"
	row := s.connection.QueryRow(query)

	var id int64
	err := row.Scan(&id)
	if err != nil {
		return "", err
	}
	return tools.IntToRadix(id), nil
}

func (s *SQLiteDB) CountUsers() int64 {
	query := "SELECT COUNT(*) FROM users"
	row := s.connection.QueryRow(query)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0
	}
	return int64(count)
}

func (s *SQLiteDB) CheckEmail(email string) bool {
	query := "SELECT COUNT(*) FROM users WHERE Email = ?"
	row := s.connection.QueryRow(query, email)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return false
	}
	return count > 0
}

func (s *SQLiteDB) StoreEmail(mail email.Email) bool {
	query := "INSERT INTO email ( User, Success, Subject, Body, Time) VALUES (?, ?, ?, ?, ?)"
	_, err := s.connection.Exec(query, mail.User, mail.Success, mail.Subject, mail.Body, mail.Time)
	return err == nil
}

func (s *SQLiteDB) DeleteEmail(userID string) bool {
	query := "DELETE FROM email WHERE user = ?"
	_, err := s.connection.Exec(query, userID)
	return err == nil
}

func (s *SQLiteDB) GetEmails() []*email.Email {
	query := "SELECT * FROM email"
	rows, err := s.connection.Query(query)
	if err != nil {
		return nil
	}
	defer rows.Close()

	emails := []*email.Email{}
	for rows.Next() {
		email := &email.Email{}
		err := rows.Scan(&email.SQLiteID, &email.User, &email.Success, &email.Subject, &email.Body, &email.Time)
		if err != nil {
			return nil
		}
		emails = append(emails, email)
	}
	return emails
}

func (s *SQLiteDB) RemoveOldSessions() bool {
	query := "DELETE FROM sessions WHERE Time < ?"
	_, err := s.connection.Exec(query, time.Now().UnixMilli())
	return err == nil
}

func (s *SQLiteDB) RemoveAlarmsWithNoDevices() bool {
	deviceIDs := []string{}
	query := "SELECT ID FROM devices"
	rows, err := s.connection.Query(query)
	if err != nil {
		return false
	}
	defer rows.Close()

	for rows.Next() {
		var id int64
		err := rows.Scan(&id)
		if err != nil {
			return false
		}
		deviceIDs = append(deviceIDs, tools.IntToRadix(id))
	}
	query = "SELECT ID, Devices, User FROM alarms"
	rows, err = s.connection.Query(query)
	if err != nil {
		return false
	}
	defer rows.Close()

	for rows.Next() {
		var id int64
		var devices string
		var user string
		err := rows.Scan(&id, &devices, &user)
		if err != nil {
			return false
		}
		//check if device is in devices
		//convert devices to slice
		devicesSlice := tools.StringToDevicesArray(devices)
		//check if device is in devices

		for _, device := range devicesSlice {
			//use funk to check if device is in devices
			if !funk.ContainsString(deviceIDs, device) {
				//delete alarm
				s.DeleteAlarm(tools.IntToRadix(id), user)
			}

		}
	}
	return true
}

func (s *SQLiteDB) AddAdminSession(admin *admin.Admin) bool {
	query := "INSERT INTO admin (Token, UserId, Time) VALUES (?, ?, ?)"
	_, err := s.connection.Exec(query, admin.Token, admin.UserId, admin.Time)
	//log.Println("AddAdminSession: ", result, err)
	return err == nil
}
