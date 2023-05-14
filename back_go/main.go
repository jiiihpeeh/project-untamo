package main

//import models from models/
import (
	"fmt"

	"github.com/flashmob/go-guerrilla"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"untamo_server.zzz/actions/rest"
	"untamo_server.zzz/actions/wshandler"
	"untamo_server.zzz/db/mongoDB"
	"untamo_server.zzz/utils/appconfig"
)

const (
	PORT = ":3001"
)

func main() {
	d := guerrilla.Daemon{}
	err := d.Start()

	if err == nil {
		fmt.Println("Server Started!")
	}

	// connect to mongodb
	//read appConfig from appconfig
	appConfig, err := appconfig.GetConfig()
	var client *mongo.Client
	if err != nil {
		dbUrl := appconfig.AskDBUrl()
		client = mongoDB.Connect(dbUrl)
		//get ownerID from mongoDB
		ownerID, err := mongoDB.GetOwnerID(client)
		if err != nil {
			//ownerID = mongoDB.CreateOwner(client)
			panic(err)
		}
		dbUrl.OwnerID = ownerID
		//log.Println("dbUrl", dbUrl)
		appconfig.SetConfig(dbUrl)
	} else {
		//marshal appConfig to json
		//appConfigJson, _ := json.Marshal(appConfig)
		// log.Println("appConfigJson", string(appConfigJson))
		// log.Println("appConfig", appConfig)
		// log.Println("appConfig", appConfig.GetUrl())
		client = mongoDB.Connect(appConfig)
	}

	//make rest api with gin /login /devices /users post get put delete on port 3001
	router := gin.Default()
	//corsConfig := cors.DefaultConfig()
	corsConfig := cors.Config{
		AllowOrigins:           []string{"*"},
		AllowMethods:           []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:           []string{"AllowCrossOriginRequests", "adminToken", "Access-Control-Allow-Header", "Origin", "Content-Type, Date", "Content-Length", "accept", "origin", "Cache-Control", "X-Requested-With", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods", "Access-Control-Allow-Credentials", "Access-Control-Max-Age", "Access-Control-Request-Headers", "Access-Control-Request-Method", "Connection", "Host", "User-Agent", "token", "Upgrade", "Sec-WebSocket-Version", "Sec-WebSocket-Key", "Sec-WebSocket-Extensions", "Pragma", "Cache-Control", "Upgrade", "Sec-WebSocket-Version", "Sec-WebSocket-Key", "Sec-WebSocket-Extensions", "Pragma", "Cache-Control"},
		AllowCredentials:       true,
		AllowWildcard:          true,
		AllowBrowserExtensions: true,
		AllowWebSockets:        true,
		AllowFiles:             true,
	}

	// Register the middleware
	router.Use(cors.New(corsConfig))

	//router.Run()
	//log in with gin and mongodb client
	router.POST("/login", func(c *gin.Context) {
		rest.LogIn(c, client)
	})
	router.POST("/logout", func(c *gin.Context) {
		rest.LogOut(c, client)
	})
	router.POST("/register", func(c *gin.Context) {
		rest.RegisterUser(c, client)
	})
	router.POST("/api/activate-account", func(c *gin.Context) {
		rest.ActivateAccount(c, client)
	})
	router.GET("/api/activation-captcha", func(c *gin.Context) {
		rest.GetActivationCaptcha(c, client)
	})
	router.POST("/forgot-password/:email", func(c *gin.Context) {
		rest.ForgotPassword(c, client)
	})
	router.POST("/store-server-config", func(c *gin.Context) {
		rest.StoreServerConfig(c, client)
	})
	router.POST("/qr-login", func(c *gin.Context) {
		rest.QRLogIn(c, client)
	})
	router.GET("/api/qr-token", func(c *gin.Context) {
		rest.GetQRToken(c, client)
	})
	router.GET("/api/devices", func(c *gin.Context) {
		rest.GetDevices(c, client)
	})
	router.POST("/api/device", func(c *gin.Context) {
		rest.AddDevice(c, client)
	})
	router.PUT("/api/device/:id", func(c *gin.Context) {
		rest.EditDevice(c, client)
	})
	router.DELETE("/api/device/:id", func(c *gin.Context) {
		rest.DeleteDevice(c, client)
	})
	router.GET("/api/alarms", func(c *gin.Context) {
		rest.GetUserAlarms(c, client)
	})
	router.POST("/api/alarm", func(c *gin.Context) {
		rest.AddAlarm(c, client)
	})
	router.PUT("/api/alarm/:id", func(c *gin.Context) {
		rest.EditAlarm(c, client)
	})
	router.DELETE("/api/alarm/:id", func(c *gin.Context) {
		rest.DeleteAlarm(c, client)
	})
	router.GET("/api/is-session-valid", func(c *gin.Context) {
		rest.IsSessionValid(c, client)
	})
	router.GET("/api/user", func(c *gin.Context) {
		rest.GetUser(c, client)
	})
	router.GET("/api/update", func(c *gin.Context) {
		rest.GetUpdate(c, client)
	})
	router.GET("/api/refresh-token", func(c *gin.Context) {
		rest.RefreshToken(c, client)
	})
	router.GET("/api/ws-token", func(c *gin.Context) {
		rest.UpdateWsToken(c, client)
	})
	router.POST("/api/admin", func(c *gin.Context) {
		rest.AdminLogIn(c, client)
	})
	router.PUT("/api/edit-user/:email", func(c *gin.Context) {
		rest.UserEdit(c, client)
	})
	router.GET("/admin/users", func(c *gin.Context) {
		rest.GetUsers(c, client)
	})
	router.PUT("/admin/user/:id", func(c *gin.Context) {
		rest.EditUserState(c, client)
	})
	router.DELETE("/admin/user/:id", func(c *gin.Context) {
		rest.RemoveUser(c, client)
	})
	router.GET("/audio-resources/resource_list.json", func(c *gin.Context) {
		rest.GetAudioResources(c, client)
	})
	router.GET("/audio-resources/:filename", func(c *gin.Context) {
		rest.AudioResource(c, client)
	})
	router.GET("/register-check", func(c *gin.Context) {
		wshandler.Register(c, client)
	})
	router.GET("/action/:token", func(c *gin.Context) {
		wshandler.Action(c, client)
	})

	router.Run(PORT) // listen and serve on
}

// move /login here
