package rest

import (
	"bytes"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
	"github.com/steambap/captcha"
	"go.mongodb.org/mongo-driver/mongo"
	"untamo_server.zzz/actions/wshandler"
	"untamo_server.zzz/db/mongoDB"
	"untamo_server.zzz/models/admin"
	"untamo_server.zzz/models/alarm"
	"untamo_server.zzz/models/device"
	"untamo_server.zzz/models/email"
	"untamo_server.zzz/models/login"
	"untamo_server.zzz/models/qr"
	"untamo_server.zzz/models/register"
	"untamo_server.zzz/models/session"
	"untamo_server.zzz/models/update"
	"untamo_server.zzz/models/user"
	"untamo_server.zzz/models/wsOut"
	"untamo_server.zzz/utils/appconfig"
	"untamo_server.zzz/utils/emailer"
	"untamo_server.zzz/utils/hash"
	"untamo_server.zzz/utils/id"
	"untamo_server.zzz/utils/list"
	"untamo_server.zzz/utils/now"
	"untamo_server.zzz/utils/token"
)

// hashmap for token and captcha
var tokenCaptchaMap = make(map[string]string)

// mutex for hashmap
var tokenCaptchaMapMutex = &sync.Mutex{}

func LogIn(c *gin.Context, client *mongo.Client) {
	loginRequest := login.LogInRequest{}
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}

	//check if email and password are not empty
	if loginRequest.Email == "" || loginRequest.Password == "" {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}

	//get user from db
	user := mongoDB.GetUserFromEmail(loginRequest.Email, client)
	//check if user exists
	if user == nil {
		c.JSON(401, gin.H{
			"message": "User not found",
		})
		return
	}

	//check if password is correct
	pass := loginRequest.Password

	//fmt.Println(pass)
	match := hash.ComparePasswordAndHash(pass, user.Password)
	if !match {
		c.JSON(401, gin.H{
			"message": "Wrong password or failed to hash password",
		})
		return
	}
	//create session using type LogInResponse struct
	//generate id for mongodb
	//add 5 years in ms to now
	//get SessionLength from appconfig
	//get appconfig mutex
	appconfig.AppConfigurationMutex.Lock()
	sessionLength := appconfig.AppConfiguration.SessionLength
	appconfig.AppConfigurationMutex.Unlock()
	expires := now.Now() + int64(sessionLength)
	if sessionLength == 0 {
		//add 10 minutes to end time
		expires = now.Now() + 600000
	}
	newSession := session.Session{
		ID:      id.GenerateId(),
		Time:    expires,
		UserId:  user.ID.Hex(),
		Token:   token.GenerateToken(token.TokenStringLength),
		WsToken: token.GenerateToken(token.WsTokenStringLength),
		WsPair:  token.GenerateToken(token.WsPairLength),
	}
	//add session to db
	//marshal session to json
	//fmt.Println(newSession)
	sID, err := mongoDB.AddSession(&newSession, client)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to add session to db",
		})
		return
	}
	newSession.ID = sID
	//fmt.Println("newSession", newSession)

	logInResponse := login.LogInResponse{
		Token:      newSession.Token,
		Email:      user.Email,
		ScreenName: user.ScreenName,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		Admin:      user.Admin,
		Owner:      user.Owner,
		Active:     user.Active,
		Time:       newSession.Time,
		WsToken:    newSession.WsToken,
		WsPair:     newSession.WsPair,
	}
	//return session as json
	c.JSON(200, logInResponse)
}

func GetDevices(c *gin.Context, client *mongo.Client) {
	// check if user is logged in by getting a session from db

	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	devices := mongoDB.GetDevices(session.UserId, client)
	//convert devices to ToDeviceOut
	deviceOut := []device.DeviceOut{}
	for _, device := range devices {
		deviceOut = append(deviceOut, device.ToDeviceOut())
	}
	c.JSON(200, deviceOut)
}

func AddDevice(c *gin.Context, client *mongo.Client) {
	// check if user is logged in by getting a session from db
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//get device from json
	deviceIn := device.DeviceOut{}
	if err := c.ShouldBindJSON(&deviceIn); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//add device to db
	newDevice := device.Device{
		//ID:         id.GenerateId(),
		User:       session.UserId,
		DeviceName: deviceIn.DeviceName,
		DeviceType: deviceIn.DeviceType,
	}
	dID, err := mongoDB.AddDevice(&newDevice, client)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to add device to db",
		})
		return
	}
	newDevice.ID = dID

	//return device as json
	deviceOut := newDevice.ToDeviceOut()
	go func() {
		out := wsOut.WsOut{Type: "deviceAdd", Data: deviceOut}
		//marshal out to json
		outJson, _ := json.Marshal(out)
		wshandler.WsServing.ServeMessage(session.UserId, session.WsToken, []byte(outJson))
	}()
	c.JSON(200, deviceOut)
}

func EditDevice(c *gin.Context, client *mongo.Client) {
	// check if user is logged in by getting a session from db
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//get device id from url
	deviceId := c.Param("id")

	deviceIn := device.DeviceOut{}
	if err := c.ShouldBindJSON(&deviceIn); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//check if ID matches deviceIn.ID
	if deviceId != deviceIn.ID {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}

	//edit device in db
	uID, _ := id.IdFromString(deviceId)
	editedDevice := device.Device{
		ID:         uID,
		User:       session.UserId,
		DeviceName: deviceIn.DeviceName,
		DeviceType: deviceIn.DeviceType,
	}
	if !mongoDB.EditDevice(&editedDevice, client) {
		c.JSON(500, gin.H{
			"message": "Failed to edit device in db",
		})
		return
	}
	deviceOut := editedDevice.ToDeviceOut()
	go func() {
		out := wsOut.WsOut{Type: "deviceEdit", Data: deviceOut}
		//marshal out to json
		outJson, _ := json.Marshal(out)
		wshandler.WsServing.ServeMessage(session.UserId, session.WsToken, []byte(outJson))
	}()
	//return device as json
	c.JSON(200, deviceOut)
}

func DeleteDevice(c *gin.Context, client *mongo.Client) {
	// check if user is logged in by getting a session from db
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//get device id from url
	deviceId := c.Param("id")
	uID, err := id.IdFromString(deviceId)
	if err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	if !mongoDB.DeleteDevice(uID, session.UserId, client) {
		c.JSON(500, gin.H{
			"message": "Failed to delete device from db",
		})
		return
	}
	//return device as json
	go func() {
		out := wsOut.WsOut{Type: "deviceDelete", Data: deviceId}
		//marshal out to json
		outJson, _ := json.Marshal(out)
		wshandler.WsServing.ServeMessage(session.UserId, session.WsToken, []byte(outJson))
	}()
	c.JSON(200, gin.H{
		"message": "Device deleted",
	})
}

func GetUserAlarms(c *gin.Context, client *mongo.Client) {
	// check if user is logged in by getting a session from db
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//get alarms from db
	alarms := mongoDB.GetUserAlarms(session.UserId, client)
	//convert alarms to ToAlarmOut
	alarmOut := []alarm.AlarmOut{}
	for _, alarm := range alarms {
		alarmOut = append(alarmOut, alarm.ToAlarmOut())
	}
	c.JSON(200, alarmOut)
}

func AddAlarm(c *gin.Context, client *mongo.Client) {
	//fmt.Println("AddAlarm")
	// check if user is logged in by getting a session from db
	userSession, userInSession := mongoDB.GetSessionFromHeader(c.Request, client)
	if userSession == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}

	//get alarm from json
	alarmIn := alarm.AlarmOut{}
	if err := c.ShouldBindJSON(&alarmIn); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//add alarm to db

	newAlarm := alarmIn.ToNewAlarm(userSession.UserId)
	//empty ID field

	alarmId, err := mongoDB.AddAlarm(&newAlarm, client)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to add alarm to db",
		})
		return
	}
	newAlarm.ID = alarmId

	added := newAlarm.ToAlarmOut()
	go func() {
		wsOut := wsOut.WsOut{Type: "alarmAdd", Data: added}
		wsOutJson, _ := json.Marshal(wsOut)
		wshandler.WsServing.ServeMessage(userSession.UserId, userSession.WsToken, []byte(wsOutJson))
	}()
	c.JSON(200, added)
}

func EditAlarm(c *gin.Context, client *mongo.Client) {
	// check if user is logged in by getting a session from db
	userSession, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if userSession == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	alarmId := c.Param("id")

	alarmIn := alarm.AlarmOut{}
	if err := c.ShouldBindJSON(&alarmIn); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//check if ID matches alarmIn.ID
	if alarmId != alarmIn.ID {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}

	editedAlarm := alarmIn.ToAlarm(userSession.UserId)
	editedAlarm.Modified = now.Now()
	if !mongoDB.EditAlarm(&editedAlarm, client) {
		c.JSON(500, gin.H{
			"message": "Failed to edit alarm in db",
		})
		return
	}
	edited := editedAlarm.ToAlarmOut()
	go func() {
		wsOut := wsOut.WsOut{Type: "alarmEdit", Data: edited}
		wsOutJson, _ := json.Marshal(wsOut)
		wshandler.WsServing.ServeMessage(userSession.UserId, userSession.WsToken, []byte(wsOutJson))
	}()
	//return alarm as json
	c.JSON(200, edited)
}

func DeleteAlarm(c *gin.Context, client *mongo.Client) {
	// check if user is logged in by getting a session from db
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	alarmId := c.Param("id")
	uID, _ := id.IdFromString(alarmId)
	if !mongoDB.DeleteAlarm(uID, session.UserId, client) {
		c.JSON(500, gin.H{
			"message": "Failed to delete alarm from db",
		})
		return
	}
	go func() {
		msg := wsOut.WsOut{Type: "alarmDelete", Data: alarmId}
		msgJson, _ := json.Marshal(msg)
		wshandler.WsServing.ServeMessage(session.UserId, session.WsToken, []byte(msgJson))
	}()
	c.JSON(200, gin.H{
		"message": "Alarm deleted",
	})
}

func IsSessionValid(c *gin.Context, client *mongo.Client) {
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "Session is valid",
	})
}

func GetAudioResources(c *gin.Context, client *mongo.Client) {
	//check if user is logged in by getting a session from db
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//list all audio resources in audio-resources folder
	audioResourcesInfo, err := ioutil.ReadDir("audio-resources")
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to read audio resources",
		})
		return
	}
	//convert audioResourcesInfo to []Filename
	audioResourceFiles := []string{}
	for _, audioResourceInfo := range audioResourcesInfo {
		filename := audioResourceInfo.Name()
		//remove file extension
		if !strings.HasSuffix(filename, ".opus") && !strings.HasSuffix(filename, ".flac") && !strings.HasSuffix(filename, ".wav") {
			continue
		}
		filename = filename[:len(filename)-len(filepath.Ext(filename))]
		// check if filename is already in audioResourceFiles
		if !list.IsInList(audioResourceFiles, filename) {
			audioResourceFiles = append(audioResourceFiles, filename)
		}
	}
	//fmt.Println("resources: ", audioResourceFiles)
	c.JSON(200, audioResourceFiles)
}

// serve static files
func AudioResource(c *gin.Context, client *mongo.Client) {
	//check if user is logged in by getting a session from db
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	fileName := "audio-resources/" + c.Param("filename")
	//check if file exists
	if _, err := os.Stat(fileName); os.IsNotExist(err) {
		c.JSON(404, gin.H{
			"message": "File not found",
		})
		return
	}
	c.File(fileName)
}

func LogOut(c *gin.Context, client *mongo.Client) {
	//check if user is logged in by getting a session from db
	token := c.Request.Header.Get("token")
	//fmt.Println(token)
	session, userInSession := mongoDB.GetSessionFromTokenActivate(token, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	//get session from header
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//delete session from db
	if !mongoDB.DeleteSession(token, client) {
		c.JSON(500, gin.H{
			"message": "Failed to delete session from db",
		})
		return
	}
	//delete token from ws handler
	go wshandler.WsServing.Disconnect(token)
	c.JSON(200, gin.H{
		"message": "Logged out",
	})
}

func QRLogIn(c *gin.Context, client *mongo.Client) {
	//get qr code from url
	qrToken := qr.QRIn{}
	if err := c.ShouldBindJSON(&qrToken); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//fmt.Println(qrToken)
	qr := mongoDB.GetQrData(qrToken.QrToken, client)
	if qr == nil {
		c.JSON(404, gin.H{
			"message": "QR not found",
		})
		//fmt.Println("QR not found")
		return
	}

	appconfig.AppConfigurationMutex.Lock()
	sessionLength := appconfig.AppConfiguration.SessionLength
	appconfig.AppConfigurationMutex.Unlock()

	endTime := int64(sessionLength) + now.Now()
	if sessionLength == 0 {
		//add 10 minutes to end time
		endTime = now.Now() + 600000
	}
	//set up a new session
	session := session.Session{
		ID:      id.GenerateId(),
		Time:    endTime,
		UserId:  qr.User,
		Token:   token.GenerateToken(token.TokenStringLength),
		WsToken: token.GenerateToken(token.TokenStringLength),
		WsPair:  token.GenerateToken(token.WsPairLength),
	}
	//add session to db
	sID, err := mongoDB.AddSession(&session, client)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to add session to db",
		})
		return
	}
	session.ID = sID
	//delete qr from db
	if !mongoDB.DeleteQr(qr.QrToken, client) {
		c.JSON(500, gin.H{
			"message": "Failed to delete qr from db",
		})
		return
	}
	//get user from db
	uID, _ := id.IdFromString(session.UserId)
	user := mongoDB.GetUserFromID(uID, client)
	if user == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}

	//form LogInResponse
	login := login.LogInResponse{
		WsToken:    session.WsToken,
		Token:      session.Token,
		Email:      session.UserId,
		ScreenName: user.ScreenName,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		Active:     user.Active,
		Admin:      user.Admin,
		Owner:      user.Owner,
		Time:       session.Time,
		WsPair:     session.WsPair,
	}
	//return login as json
	c.JSON(200, login)
}

func GetQRToken(c *gin.Context, client *mongo.Client) {
	//check session
	session, _ := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//generate qr token
	qrToken := token.GenerateToken(96)
	qr := qr.QR{
		ID:      id.GenerateId(),
		Time:    now.Now() + 25000,
		User:    session.UserId,
		QrToken: qrToken,
	}
	//add qr to db
	//fmt.Println(qr)
	if !mongoDB.AddQr(&qr, client) {
		c.JSON(500, gin.H{
			"message": "Failed to add qr to db",
		})
		return
	}
	go func() {
		//delete qr from db after 25 seconds
		time.Sleep(26 * time.Second)
		mongoDB.DeleteQr(qrToken, client)
		//return qr token as string
	}()
	c.JSON(200, gin.H{
		"qrToken": qrToken,
	})
}

func AdminLogIn(c *gin.Context, client *mongo.Client) {
	session, user := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	if user == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//check if user is admin
	if !user.Admin {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//get password from json
	password := admin.AdminLogIn{}
	if err := c.ShouldBindJSON(&password); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//check if password is correct
	match := hash.ComparePasswordAndHash(password.Password, user.Password)
	if !match {
		c.JSON(401, gin.H{
			"message": "Wrong password or failed to hash password",
		})
		return
	}
	//create admin using Admin struct
	adminSession := admin.Admin{
		ID:     id.GenerateId(),
		Token:  token.GenerateToken(128),
		UserId: user.ID.Hex(),
		//add 10 minutes to now in ms
		Time: now.Now() + 600000,
	}
	//add admin to db
	if !mongoDB.AddAdminSession(&adminSession, client) {
		c.JSON(500, gin.H{
			"message": "Failed to add admin to db",
		})
		return
	}
	go func() {
		//delete admin from db after 10 minutes
		time.Sleep(601 * time.Second)
		mongoDB.DeleteAdminSession(adminSession.Token, client)
	}()
	adminCreds := admin.AdminData{
		AdminToken: adminSession.Token,
		Time:       adminSession.Time,
	}
	//return adminCreds as json
	c.JSON(200, adminCreds)
}

func GetUsers(c *gin.Context, client *mongo.Client) {
	adminSession, _ := mongoDB.GetAdminSessionFromHeader(c.Request, client)
	if adminSession == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//get users from db
	users := mongoDB.GetUsers(client)
	//convert users to []UserOut
	usersOut := []user.UserOut{}
	for _, user := range users {
		userOut := user.ToUserOut()
		usersOut = append(usersOut, userOut)
	}
	//return usersOut as json
	c.JSON(200, usersOut)
}

func UserEdit(c *gin.Context, client *mongo.Client) {
	session, userInSession := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//check if user and email from params match
	email := c.Param("email")
	if email != userInSession.Email {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//get EditUser from json
	editUser := user.EditUser{}
	if err := c.ShouldBindJSON(&editUser); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	if !editUser.CheckEmail() {
		c.JSON(400, gin.H{
			"message": "Email is not valid",
		})
		return
	}
	if editUser.CheckPassword() {
		c.JSON(400, gin.H{
			"message": "Password is redundant",
		})
		return
	}
	//check if confirm password matches password using hash
	match := hash.ComparePasswordAndHash(editUser.ConfirmPassword, userInSession.Password)
	if !match {
		c.JSON(401, gin.H{
			"message": "Wrong password or failed to hash password",
		})
		return
	}
	//check if password is strong enough using zxcvbn
	passwordHash := userInSession.Password
	if editUser.Password != "" {
		estimate := register.Estimate(editUser.Password)
		if estimate.Guesses < register.MinimumGuesses {
			c.JSON(400, gin.H{
				"message": "Password is not strong enough",
			})
			return
		}
		//hash password
		passwordHashed, err := hash.HashPassword(editUser.Password)
		if err != nil {
			c.JSON(500, gin.H{
				"message": "Failed to hash password",
			})
			return
		}
		passwordHash = passwordHashed
	}
	user := user.User{
		ID:         userInSession.ID,
		Email:      editUser.Email,
		Password:   passwordHash,
		ScreenName: editUser.ScreenName,
		FirstName:  editUser.FirstName,
		LastName:   editUser.LastName,
		Admin:      userInSession.Admin,
		Owner:      userInSession.Owner,
		Active:     userInSession.Active,
		Activate:   userInSession.Activate,
		Registered: userInSession.Registered,
	}
	updated := mongoDB.UpdateUser(&user, client)
	if !updated {
		c.JSON(500, gin.H{
			"message": "Failed to update user",
		})
		return
	}
	go func() {
		out := user.ToUserOut()
		//marshal out to json
		userOut := wsOut.WsOut{Type: "userEdit", Data: out}
		outJson, _ := json.Marshal(userOut)
		wshandler.WsServing.ServeMessage(user.ID.Hex(), session.WsToken, []byte(outJson))
	}()

	//return message success
	c.JSON(200, gin.H{
		"message": "User updated",
	})
}

func EditUserState(c *gin.Context, client *mongo.Client) {
	adminSession, userInSession := mongoDB.GetAdminSessionFromHeader(c.Request, client)
	if adminSession == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	userID := c.Param("id")
	adminRequest := admin.AdminRequest{}
	if err := c.ShouldBindJSON(&adminRequest); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//get user by id
	uID, _ := id.IdFromString(userID)

	userEdit := mongoDB.GetUserFromID(uID, client)
	if userEdit == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//check if user is owner
	if userEdit.Owner {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//check if userInSession has same id as user and return unauthorized if it is
	if userInSession.ID.Hex() == userEdit.ID.Hex() {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	userEdit.Admin = adminRequest.Admin
	userEdit.Active = adminRequest.Active
	updated := mongoDB.UpdateUser(userEdit, client)
	if !updated {
		c.JSON(500, gin.H{
			"message": "Failed to update user",
		})
		return
	}

	//marshal out to json
	go func() {
		outUser := userEdit.ToUserOut()
		userOut := wsOut.WsOut{Type: "userEdit", Data: outUser}
		outJson, _ := json.Marshal(userOut)
		wshandler.WsServing.ServeMessage(userEdit.ID.Hex(), string("all"), []byte(outJson))
	}()

	//if edited user is remove all sessions from db
	if !adminRequest.Active {
		if !mongoDB.DeleteUserSessions(userEdit.ID, client) {
			c.JSON(500, gin.H{
				"message": "Failed to delete user sessions",
			})
			return
		}
	}
	//return list of users
	users := mongoDB.GetUsers(client)
	//convert users to []UserOut
	usersOut := []user.UserOut{}
	for _, user := range users {
		userOut := user.ToUserOut()
		usersOut = append(usersOut, userOut)
	}
	//return usersOut as json
	c.JSON(200, usersOut)
}

func RemoveUser(c *gin.Context, client *mongo.Client) {
	adminSession, userInSession := mongoDB.GetAdminSessionFromHeader(c.Request, client)
	if adminSession == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	userID := c.Param("id")
	//get user by id
	uID, err := id.IdFromString(userID)
	if err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	userEdit := mongoDB.GetUserFromID(uID, client)
	if userEdit == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//check if user is owner
	if userEdit.Owner {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//check if userInSession has same id as user and return unauthorized if it is
	if userInSession.ID.Hex() == userEdit.ID.Hex() {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}
	//delete user from db
	if !mongoDB.RemoveUser(userEdit.ID, client) {
		c.JSON(500, gin.H{
			"message": "Failed to delete user",
		})
		return
	}
	//delete all user sessions from db
	if !mongoDB.DeleteUserSessions(userEdit.ID, client) {
		c.JSON(500, gin.H{
			"message": "Failed to delete user sessions",
		})
		return
	}
	//return message success
	users := mongoDB.GetUsers(client)
	//convert users to []UserOut
	usersOut := []user.UserOut{}
	for _, user := range users {
		userOut := user.ToUserOut()
		usersOut = append(usersOut, userOut)
	}
	//return usersOut as json
	c.JSON(200, usersOut)
}

func RefreshToken(c *gin.Context, client *mongo.Client) {
	//get session from header
	session, userInSession := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}

	newToken := token.GenerateToken(64)
	session.Token = newToken
	session.Time = now.Now() + 157680000000
	//update session in db
	if !mongoDB.UpdateSession(session, client) {
		c.JSON(500, gin.H{
			"message": "Failed to update session",
		})
		return
	}
	refresh := login.RefreshToken{
		Token: session.Token,
		Time:  session.Time,
	}
	//return refresh as json
	c.JSON(200, refresh)
}

func RegisterUser(c *gin.Context, client *mongo.Client) {
	registerRequest := register.RegisterRequest{}
	if err := c.ShouldBindJSON(&registerRequest); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	if registerRequest.Question != "" {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//check if email and password are not empty
	if registerRequest.Email == "" || registerRequest.Password == "" {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//check if email is valid

	if !registerRequest.CheckEmail() {
		c.JSON(400, gin.H{
			"message": "Bad email",
		})
		return
	}
	//check if email is already in use
	if mongoDB.CheckEmail(registerRequest.Email, client) {
		c.JSON(400, gin.H{
			"message": "Email already in use",
		})
		return
	}
	//check if password is valid
	if !registerRequest.CheckPassword() {
		c.JSON(400, gin.H{
			"message": "Redundant password",
		})
		return
	}

	//check if password is strong enough using zxcvbn
	estimate := register.Estimate(registerRequest.Password)
	if estimate.Score < 3 {
		c.JSON(400, gin.H{
			"message": "Password is not strong enough",
		})
		return
	}
	if estimate.Guesses < register.MinimumGuesses {
		c.JSON(400, gin.H{
			"message": "Password is not strong enough",
		})
		return
	}
	//hash password
	passwordHashed, err := hash.HashPassword(registerRequest.Password)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to hash password",
		})
		return
	}

	//create user using User struct
	ownerAdmin := mongoDB.CountUsers(client) == 0
	user := user.User{
		Email:      registerRequest.Email,
		Password:   passwordHashed,
		ScreenName: registerRequest.FormScreenName(),
		FirstName:  registerRequest.FirstName,
		LastName:   registerRequest.LastName,
		Admin:      ownerAdmin,
		Owner:      ownerAdmin,
		Registered: now.Now(),
		Active:     ownerAdmin,
	}
	if !ownerAdmin {
		user.Activate = token.GenerateToken(16)[0:16]
	}
	appconfig.AppConfigurationMutex.Lock()
	config := appconfig.AppConfiguration
	appconfig.AppConfigurationMutex.Unlock()
	if config.ActivateAuto {
		user.Active = true
		user.Activate = ""
	} else if config.ActivateEmail {
		go func() {
			emailMsg := email.Email{
				Subject: "Activate your account",
				Body:    "Your activation code for Untamo is: " + user.Activate,
				User:    user.Email,
				Time:    now.Now(),
			}
			sent := emailer.SendEmail(&emailMsg)
			if !sent {
				emailMsg.Success = false
				mongoDB.StoreEmail(emailMsg, client)
			}
		}()
	}

	//add user to db
	uID, err := mongoDB.AddUser(&user, client)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to add user to db",
		})
		return
	}

	user.ID = uID

	c.JSON(200, gin.H{
		"message": "User registered",
	})
}

func GetUser(c *gin.Context, client *mongo.Client) {
	//get user from header
	session, userInSession := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//get user from db
	user := mongoDB.GetUserFromID(userInSession.ID, client)
	if user == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//return user as json
	c.JSON(200, user.ToUserOut())
}

// update WsToKen in session
func UpdateWsToken(c *gin.Context, client *mongo.Client) {
	//get session from header
	session, userInSession := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//generate new wsToken
	newWsToken := token.GenerateToken(66)
	session.WsToken = newWsToken
	//update session in db
	if !mongoDB.UpdateSession(session, client) {
		c.JSON(500, gin.H{
			"message": "Failed to update session",
		})
		return
	}
	//return new wsToken as json
	c.JSON(200, gin.H{
		"wsToken": newWsToken,
	})
}

func GetUpdate(c *gin.Context, client *mongo.Client) {
	//get session from header
	session, userInSession := mongoDB.GetSessionFromHeader(c.Request, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//get update from db
	alarms := mongoDB.GetUserAlarms(session.UserId, client)
	if alarms == nil {
		c.JSON(404, gin.H{
			"message": "Alarms not found",
		})
		return
	}
	devices := mongoDB.GetDevices(session.UserId, client)
	if devices == nil {
		c.JSON(404, gin.H{
			"message": "Devices not found",
		})
		return
	}
	//convert alarms to []AlarmOut
	alarmsOut := []alarm.AlarmOut{}
	for _, alarm := range alarms {
		alarmsOut = append(alarmsOut, alarm.ToAlarmOut())
	}
	//convert devices to []DeviceOut
	devicesOut := []device.DeviceOut{}
	for _, device := range devices {
		devicesOut = append(devicesOut, device.ToDeviceOut())
	}
	//convert userInSession to UserOut
	userInSessionOut := userInSession.ToUserOut()
	//form update
	update := update.Update{
		Alarms:  alarmsOut,
		Devices: devicesOut,
		User:    userInSessionOut,
	}

	//return update as json
	c.JSON(200, update)
}

func ActivateAccount(c *gin.Context, client *mongo.Client) {
	//activate?verification=${verification}&captcha=${captchaResp}&accepted=${accepted}
	//sleep 100 milliseconds
	time.Sleep(100 * time.Millisecond)
	activation := register.ActivationRequest{}
	if err := c.ShouldBindJSON(&activation); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}

	if !activation.Accepted {
		c.JSON(400, gin.H{
			"message": "Bad captcha",
		})
		return
	}

	//fetch session and user from headers
	token := c.Request.Header.Get("token")
	tokenCaptchaMapMutex.Lock()
	captcha := tokenCaptchaMap[token]
	delete(tokenCaptchaMap, token)
	tokenCaptchaMapMutex.Unlock()
	if activation.Captcha != captcha {
		c.JSON(400, gin.H{
			"message": "Bad captcha",
		})
		return
	}
	session, userInSession := mongoDB.GetSessionFromTokenActivate(token, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//check that user is not active
	if userInSession.Active {
		c.JSON(400, gin.H{
			"message": "User is already active",
		})
		return
	}

	//check that user has correct verification
	if userInSession.Activate != activation.Verification {
		c.JSON(400, gin.H{
			"message": "Wrong verification",
		})
		return
	}
	//activate user
	userInSession.Active = true
	//set activate to empty string
	userInSession.Activate = ""
	//update user in db
	if !mongoDB.UpdateUser(userInSession, client) {
		c.JSON(500, gin.H{
			"message": "Failed to update user",
		})
		return
	}
	//return message success
	c.JSON(200, gin.H{
		"message": "User activated",
	})
}

func ForgotPassword(c *gin.Context, client *mongo.Client) {
	//get get email from params
	emailAddress := c.Param("email")
	//get user from email from db
	user := mongoDB.GetUserFromEmail(emailAddress, client)
	if user == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//generate reset token
	resetToken := token.GenerateToken(18)
	//set reset token in user
	user.PasswordResetToken = resetToken[0:18]
	user.PasswordResetRequestTime = now.Now()
	//update user in db
	if !mongoDB.UpdateUser(user, client) {
		c.JSON(500, gin.H{
			"message": "Failed to update user",
		})
		return
	}
	//send email to user with reset token
	go func() {
		mail := email.Email{
			Subject: "Reset your password",
			Body:    "You have 10 minutes left to change your password. Your password reset code for Untamo is: " + user.PasswordResetToken,
			User:    user.Email,
			Time:    now.Now(),
		}
		emailer.SendEmail(&mail)
	}()
	//return message success
	c.JSON(200, gin.H{
		"message": "Reset token sent",
	})
}

func ResetPassword(c *gin.Context, client *mongo.Client) {
	//get reset token and email from json
	reset := user.ResetPasswordRequest{}
	if err := c.ShouldBindJSON(&reset); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//get user from email from db
	userToEdit := mongoDB.GetUserFromEmail(reset.Email, client)
	if userToEdit == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//check if reset token matches user reset token
	if userToEdit.PasswordResetToken != reset.PasswordResetToken {
		c.JSON(400, gin.H{
			"message": "Wrong reset token",
		})
		return
	}
	//check if password and confirm password match
	if reset.Password != reset.ConfirmPassword {
		c.JSON(400, gin.H{
			"message": "Passwords don't match",
		})
		return
	}
	//check if reset token is expired ( 10 minutes  and 5 seconds)
	if userToEdit.PasswordResetRequestTime+605000 < now.Now() {
		c.JSON(400, gin.H{
			"message": "Reset token expired",
		})
		return
	}
	userToEdit.PasswordResetToken = ""
	userToEdit.PasswordResetRequestTime = 0

	editUser := user.EditUser{}
	editUser.Password = reset.Password
	editUser.Email = reset.Email
	editUser.ConfirmPassword = reset.ConfirmPassword
	editUser.FirstName = userToEdit.FirstName
	editUser.LastName = userToEdit.LastName
	editUser.ScreenName = userToEdit.ScreenName
	if !editUser.CheckPassword() {
		c.JSON(400, gin.H{
			"message": "Redundant password",
		})
		return
	}
	//check if password is strong enough using zxcvbn
	estimate := register.Estimate(editUser.Password)
	if estimate.Score < 3 {
		c.JSON(400, gin.H{
			"message": "Password is not strong enough",
		})
		return
	}
	if estimate.Guesses < register.MinimumGuesses {
		c.JSON(400, gin.H{
			"message": "Password is not strong enough",
		})
		return
	}
	//hash password
	passwordHashed, err := hash.HashPassword(editUser.Password)
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to hash password",
		})
		return
	}
	userToEdit.Password = passwordHashed
	//update user in db
	if !mongoDB.UpdateUser(userToEdit, client) {
		c.JSON(500, gin.H{
			"message": "Failed to update user",
		})
		return
	}
	//return message success
	c.JSON(200, gin.H{
		"message": "Password reset, Log in with your new password",
	})
}

func StoreServerConfig(c *gin.Context, client *mongo.Client) {
	//get original config from appconfig module
	originalConfig, err := appconfig.GetConfig()
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to get original config",
		})
		return
	}
	//override original config with new config from json
	newConfig := appconfig.AppConfig{}
	if err := c.ShouldBindJSON(&newConfig); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	newConfig.OwnerID = originalConfig.OwnerID
	newConfig.PasswordDB = originalConfig.PasswordDB
	newConfig.UserDB = originalConfig.UserDB
	//save new config to appconfig module

}

func GetActivationCaptcha(c *gin.Context, client *mongo.Client) {
	time.Sleep(250 * time.Millisecond)
	token := c.Request.Header.Get("token")
	//check if token is in tokenCaptchaMap
	tokenCaptchaMapMutex.Lock()
	_, ok := tokenCaptchaMap[token]
	tokenCaptchaMapMutex.Unlock()
	// return 400 if token is  in tokenCaptchaMap
	if ok {
		c.JSON(400, gin.H{
			"message": "Captcha already requested",
		})
		return
	}

	//fmt.Println(token)
	session, userInSession := mongoDB.GetSessionFromTokenActivate(token, client)
	if session == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	//get session from header
	if userInSession == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	//generate captcha
	captchaData, _ := captcha.New(150, 50)

	imageBuffer := bytes.NewBuffer([]byte{})
	//write captcha image to io.writer
	captchaData.WriteImage(imageBuffer)
	//calculate sha512 hash from imageBuffer
	imageBytes := imageBuffer.Bytes()
	hash := sha512.New()
	hash.Write(imageBytes)
	//convert hash to string
	hashString := hex.EncodeToString(hash.Sum(nil))[5:9]

	tokenCaptchaMapMutex.Lock()
	tokenCaptchaMap[token] = hashString
	tokenCaptchaMapMutex.Unlock()
	//return imageBytes as image
	c.Data(200, "image/png", imageBytes)
}

func GetOwnerSettings(c *gin.Context, client *mongo.Client) {
	//get admin session from header
	adminSession, userInSession := mongoDB.GetAdminSessionFromHeader(c.Request, client)
	if adminSession == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	if !userInSession.Owner {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	appconfig.AppConfigurationMutex.Lock()
	config := appconfig.AppConfiguration
	appconfig.AppConfigurationMutex.Unlock()

	//get owner settings from config
	//return owner settings as json

	c.JSON(200, config)
}

func SetOwnerSettings(c *gin.Context, client *mongo.Client) {
	//get admin session from header
	adminSession, userInSession := mongoDB.GetAdminSessionFromHeader(c.Request, client)
	if adminSession == nil {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
	}
	//check if user is owner
	if !userInSession.Owner {
		c.JSON(401, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	//get owner settings from json
	configuration := appconfig.AppConfig{}
	if err := c.ShouldBindJSON(&configuration); err != nil {
		c.JSON(400, gin.H{
			"message": "Bad request",
		})
		return
	}
	//set owner id in config
	appconfig.SetConfig(&configuration)
	app, error := appconfig.GetConfig()
	if error != nil {
		c.JSON(500, gin.H{
			"message": "Failed to get config",
		})
		return
	}

	appconfig.AppConfigurationMutex.Lock()
	appconfig.AppConfiguration = app
	appconfig.AppConfigurationMutex.Unlock()

	//return appconfig as json
	c.JSON(200, app)
}

func ResendActivation(c *gin.Context, client *mongo.Client) {
	emailActivate := c.Param("email")
	//check that user is not active
	user := mongoDB.GetUserFromEmail(emailActivate, client)
	if user == nil {
		c.JSON(404, gin.H{
			"message": "User not found",
		})
		return
	}
	if user.Active {
		c.JSON(400, gin.H{
			"message": "User is already active",
		})
		return
	}
	//check if user has activate token
	if user.Activate == "" {
		c.JSON(400, gin.H{
			"message": "User is account is probably suspended",
		})
		return
	}
	//send email to user with activate token
	go func() {
		emailMsg := email.Email{
			Subject: "Activate your account",
			Body:    "Your activation code for Untamo is: " + user.Activate,
			User:    user.Email,
			Time:    now.Now(),
		}
		sent := emailer.SendEmail(&emailMsg)
		if !sent {
			emailMsg.Success = false
			mongoDB.StoreEmail(emailMsg, client)
		}
	}()
	//return message success
	c.JSON(200, gin.H{
		"message": "Activation code sent",
	})
}

func Index(c *gin.Context) {

	content, err := ioutil.ReadFile("./dist/index.html")
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to read index.html",
		})
		return
	}
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(content)))
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to read index.html",
		})
		return
	}

	uri := c.Request.Header.Get("X-Forwarded-Uri")

	if uri != "" {
		doc.Find("link").Each(func(i int, s *goquery.Selection) {
			href, _ := s.Attr("href")
			s.SetAttr("href", uri+href)
		})
		doc.Find("script").Each(func(i int, s *goquery.Selection) {
			src, _ := s.Attr("src")
			s.SetAttr("src", uri+src)
		})
		doc.Find("meta").Each(func(i int, s *goquery.Selection) {
			property, _ := s.Attr("property")
			if property == "url" {
				s.SetAttr("extend", uri)
			}
		})
	}
	host := c.Request.Header.Get("X-Forwarded-Host")

	proto := c.Request.Header.Get("X-Forwarded-Proto")
	if proto != "" && host != "" {
		doc.Find("meta").Each(func(i int, s *goquery.Selection) {
			property, _ := s.Attr("property")
			if property == "server" {
				s.SetAttr("address", proto+"://"+host+uri)
			}
		})
	}
	//convert doc to string
	byteContent, err := doc.Html()
	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed to read index.html",
		})
		return
	}
	//fmt.Println(byteContent)
	c.Data(200, "text/html; charset=utf-8", []byte(byteContent))
}

func Assets(c *gin.Context) {
	//serve dist/assets
	fileName := c.Param("file")
	filePath := "./dist/assets/" + fileName
	//fmt.Println(filePath)
	c.File(filePath)
}
