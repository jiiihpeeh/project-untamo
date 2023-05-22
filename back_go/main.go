package main

//import models from models/
import (
	"flag"
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"untamo_server.zzz/actions/checkers"
	"untamo_server.zzz/actions/rest"
	"untamo_server.zzz/actions/wshandler"
	"untamo_server.zzz/db/mongoDB"
	"untamo_server.zzz/utils/appconfig"
)

const (
	PORTDEFAULT = uint(3001)
)

var (
	debugMode  bool
	enableCORS bool
	PORT       string
)

func main() {
	flag.BoolVar(&debugMode, "debug", false, "Enable debug mode")
	flag.BoolVar(&enableCORS, "cors", false, "Enable CORS")
	//parse PORT from command line use default if not provided
	var port uint
	flag.UintVar(&port, "port", PORTDEFAULT, "Port to listen on")
	PORT = fmt.Sprintf(":%d", port)
	flag.Parse()
	if debugMode {
		fmt.Println("Debug mode enabled")
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	appConfig, err := appconfig.GetConfig()
	//cstr, err := json.Marshal(appConfig)
	//fmt.Println(string(string(cstr)))

	var client *mongo.Client
	if err != nil {
		settings := appconfig.AskDBUrl()
		uri := settings.GetUrl()
		client = mongoDB.Connect(uri)
		//get ownerID from mongoDB
		ownerID, err := mongoDB.GetOwnerID(client)
		loadConfig := appconfig.AskActivation()
		settings.ActivateAuto = loadConfig.ActivateAuto
		settings.ActivateEmail = loadConfig.ActivateEmail
		if err != nil {
			//ownerID = mongoDB.CreateOwner(client)
			ownerID = appconfig.CreateOwnerUserPrompt(client)
		}
		if settings.Email == "" {
			cfg := appconfig.OwnerConfigPrompt()
			settings.Email = cfg.Email
			settings.Password = cfg.Password
			settings.EmailPort = cfg.EmailPort
			settings.EmailServer = cfg.EmailServer
			settings.EmailPlainAuth = cfg.EmailPlainAuth
		}

		settings.OwnerID = ownerID

		//log.Println("dbUrl", dbUrl)
		appconfig.SetConfig(settings)
		appConfig, err = appconfig.GetConfig()
		if err != nil {
			panic(err)
		}
	} else {
		client = mongoDB.Connect(appConfig.GetUrl())
	}
	appconfig.AppConfigurationMutex.Lock()
	appconfig.AppConfiguration = appConfig
	appconfig.AppConfigurationMutex.Unlock()
	//make rest api with gin /login /devices /users post get put delete on port 3001

	router := gin.Default()
	//corsConfig := cors.DefaultConfig()

	// Register the middleware
	if enableCORS {
		fmt.Println("CORS enabled")
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
		router.Use(cors.New(corsConfig))
	}
	router.Use(gzip.Gzip(gzip.DefaultCompression, gzip.WithExcludedPathsRegexs([]string{"/action/*"})))
	//react vite part begins
	router.GET("/", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/assets/:file", func(c *gin.Context) {
		rest.Assets(c)
	})
	router.GET("/login", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/alarms", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/admin", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/owner", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/reset-password", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/activate", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/register", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/welcome", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/clueless", func(c *gin.Context) {
		rest.Index(c)
	})
	router.GET("/play-alarm", func(c *gin.Context) {
		rest.Index(c)
	})
	//react vite part ends
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
	router.PUT("/resend-activation/:email", func(c *gin.Context) {
		rest.ResendActivation(c, client)
	})
	router.GET("/api/activation-captcha", func(c *gin.Context) {
		rest.GetActivationCaptcha(c, client)
	})
	router.PUT("/forgot-password/:email", func(c *gin.Context) {
		rest.ForgotPassword(c, client)
	})
	router.POST("/reset-password", func(c *gin.Context) {
		rest.ResetPassword(c, client)
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
	router.GET("/admin/owner-settings", func(c *gin.Context) {
		rest.GetOwnerSettings(c, client)
	})
	router.POST("/admin/owner-settings", func(c *gin.Context) {
		rest.SetOwnerSettings(c, client)
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

	//run PingPong
	go wshandler.Ping()
	go checkers.SendUnsentEmails(client)
	router.Run(PORT) // listen and serve on
}
