package main

//import models from models/
import (
	"embed"
	"flag"
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"untamo_server.zzz/actions/checkers"
	"untamo_server.zzz/actions/rest"
	"untamo_server.zzz/actions/wshandler"
	"untamo_server.zzz/database"
	"untamo_server.zzz/database/mongoDB"
	"untamo_server.zzz/database/sqliteDB"
	"untamo_server.zzz/utils/appconfig"
	"untamo_server.zzz/utils/dbConnection"
)

const (
	PORTDEFAULT = uint(3001)
)

var (
	debugMode   bool
	enableCORS  bool
	PORT        string
	DisableGZIP bool
)

//go:embed all:dist/*
var resources embed.FS

//go:embed all:audio-resources/*
var audioFiles embed.FS

func main() {
	err := error(nil)
	flag.BoolVar(&debugMode, "debug", false, "Enable debug mode")
	flag.BoolVar(&enableCORS, "cors", false, "Enable CORS")
	flag.BoolVar(&DisableGZIP, "disable-gzip", false, "Disable GZIP")
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
	//dbType := flag.String("db", "mongo", "database type (mongo or sqlite)")
	flag.Parse()

	// Create an instance of the chosen database implementation

	var db database.Database
	// switch *dbType {
	// case "mongo":
	// 	db = &mongoDB.MongoDB{}
	// case "sqlite":
	// 	db = &sqliteDB.SQLiteDB{}

	// default:
	// 	fmt.Println("Invalid database type. Using default.")
	// 	db = &sqliteDB.SQLiteDB{}
	// }
	appConfig, err := appconfig.GetConfig()
	//cstr, err := json.Marshal(appConfig)
	//fmt.Println(string(string(cstr)))

	//var client *mongo.Client
	if err != nil {
		settings := appconfig.AskDBUrl()
		dbConnection.UseSQLite = settings.DatabaseType == "sqlite"
		uri := settings.GetUrl()
		if dbConnection.UseSQLite {
			uri = settings.DatabasePath
			dbConnection.UseSQLite = true
			fmt.Println("Using SQLite")
			db = &sqliteDB.SQLiteDB{}
			db.Connect(uri)
		} else {
			dbConnection.UseSQLite = false
			fmt.Println("Using MongoDB")
			db = &mongoDB.MongoDB{}
			db.Connect(uri)
		}
		//fmt.Println("dbType", *dbType)
		fmt.Println("uri", uri)
		//dbConn := db.Connect(uri)
		//db = dbConn.(database.Database)
		//get ownerID from mongoDB
		ownerID, err := db.GetOwnerID()
		loadConfig := appconfig.AskActivation()
		settings.ActivateAuto = loadConfig.ActivateAuto
		settings.ActivateEmail = loadConfig.ActivateEmail
		if err != nil {
			//ownerID = mongoDB.CreateOwner(client)
			ownerID = appconfig.CreateOwnerUserPrompt(&db)
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
		if appConfig.DatabaseType == "sqlite" {
			dbConnection.UseSQLite = true
			fmt.Println("Using SQLite")
			db = &sqliteDB.SQLiteDB{}
			db.Connect(appConfig.DatabasePath)
		} else {
			dbConnection.UseSQLite = false
			fmt.Println("Using MongoDB")
			db = &mongoDB.MongoDB{}
			db.Connect(appConfig.UrlDB)
		}
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
	if !DisableGZIP {
		router.Use(gzip.Gzip(gzip.DefaultCompression, gzip.WithExcludedPathsRegexs([]string{"/action/*", "/api/qr-token", "/qr-login"})))
	} else {
		fmt.Println("GZIP disabled")
	}

	//react vite part begins
	router.GET("/", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/assets/:file", func(c *gin.Context) {
		rest.Assets(c, resources)
	})
	router.GET("/login", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/alarms", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/admin", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/owner", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/reset-password", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/activate", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/register", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/welcome", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/clueless", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	router.GET("/play-alarm", func(c *gin.Context) {
		rest.Index(c, resources)
	})
	//react vite part ends
	router.POST("/login", func(c *gin.Context) {
		rest.LogIn(c, &db)
	})
	router.POST("/logout", func(c *gin.Context) {
		rest.LogOut(c, &db)
	})
	router.POST("/register", func(c *gin.Context) {
		rest.RegisterUser(c, &db)
	})
	router.POST("/api/activate-account", func(c *gin.Context) {
		rest.ActivateAccount(c, &db)
	})
	router.PUT("/resend-activation/:email", func(c *gin.Context) {
		rest.ResendActivation(c, &db)
	})
	router.GET("/api/activation-captcha", func(c *gin.Context) {
		rest.GetActivationCaptcha(c, &db)
	})
	router.PUT("/forgot-password/:email", func(c *gin.Context) {
		rest.ForgotPassword(c, &db)
	})
	router.POST("/reset-password", func(c *gin.Context) {
		rest.ResetPassword(c, &db)
	})
	router.POST("/store-server-config", func(c *gin.Context) {
		rest.StoreServerConfig(c, &db)
	})
	router.POST("/qr-login", func(c *gin.Context) {
		rest.QRLogIn(c, &db)
	})
	router.GET("/api/qr-token", func(c *gin.Context) {
		rest.GetQRToken(c, &db)
	})
	router.GET("/api/devices", func(c *gin.Context) {
		rest.GetDevices(c, &db)
	})
	router.POST("/api/device", func(c *gin.Context) {
		rest.AddDevice(c, &db)
	})
	router.PUT("/api/device/:id", func(c *gin.Context) {
		rest.EditDevice(c, &db)
	})
	router.DELETE("/api/device/:id", func(c *gin.Context) {
		rest.DeleteDevice(c, &db)
	})
	router.GET("/api/alarms", func(c *gin.Context) {
		rest.GetUserAlarms(c, &db)
	})
	router.POST("/api/alarm", func(c *gin.Context) {
		rest.AddAlarm(c, &db)
	})
	router.PUT("/api/alarm/:id", func(c *gin.Context) {
		rest.EditAlarm(c, &db)
	})
	router.DELETE("/api/alarm/:id", func(c *gin.Context) {
		rest.DeleteAlarm(c, &db)
	})
	router.GET("/api/is-session-valid", func(c *gin.Context) {
		rest.IsSessionValid(c, &db)
	})
	router.GET("/api/user", func(c *gin.Context) {
		rest.GetUser(c, &db)
	})
	router.GET("/api/update", func(c *gin.Context) {
		rest.GetUpdate(c, &db)
	})
	router.GET("/api/refresh-token", func(c *gin.Context) {
		rest.RefreshToken(c, &db)
	})
	router.GET("/api/ws-token", func(c *gin.Context) {
		rest.UpdateWsToken(c, &db)
	})
	router.POST("/api/admin", func(c *gin.Context) {
		rest.AdminLogIn(c, &db)
	})
	router.PUT("/api/edit-user/:email", func(c *gin.Context) {
		rest.UserEdit(c, &db)
	})
	router.GET("/admin/users", func(c *gin.Context) {
		rest.GetUsers(c, &db)
	})
	router.PUT("/admin/user/:id", func(c *gin.Context) {
		rest.EditUserState(c, &db)
	})
	router.DELETE("/admin/user/:id", func(c *gin.Context) {
		rest.RemoveUser(c, &db)
	})
	router.GET("/admin/owner-settings", func(c *gin.Context) {
		rest.GetOwnerSettings(c, &db)
	})
	router.POST("/admin/owner-settings", func(c *gin.Context) {
		rest.SetOwnerSettings(c, &db)
	})
	router.GET("/audio-resources/resource_list.json", func(c *gin.Context) {
		rest.GetAudioResources(c, &db, audioFiles)
	})
	router.GET("/audio-resources/:filename", func(c *gin.Context) {
		rest.AudioResource(c, &db, audioFiles)
	})
	router.GET("/register-check", func(c *gin.Context) {
		wshandler.Register(c, &db)
	})
	router.GET("/action/:token", func(c *gin.Context) {
		wshandler.Action(c, &db)
	})

	//run PingPong
	go wshandler.Ping()
	go checkers.SendUnsentEmails(&db)
	go checkers.RemoveOldSessions(&db)
	go checkers.RemoveAlarmsWithNoDevices(&db)
	router.Run(PORT) // listen and serve on
}
