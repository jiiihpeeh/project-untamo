package main

//import models from models/
import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"untamo_server.zzz/actions/rest"
	"untamo_server.zzz/actions/wshandler"
	"untamo_server.zzz/db/mongoDB"
)

const (
	PORT = ":3001"
)

func main() {

	// connect to mongodb
	client := mongoDB.Connect()

	//make rest api with gin /login /devices /users post get put delete on port 3001
	router := gin.Default()
	//corsConfig := cors.DefaultConfig()
	corsConfig := cors.Config{
		AllowOrigins:           []string{"*"},
		AllowMethods:           []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:           []string{"Access-Control-Allow-Header", "Origin", "Content-Type, Date", "Content-Length", "accept", "origin", "Cache-Control", "X-Requested-With", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods", "Access-Control-Allow-Credentials", "Access-Control-Max-Age", "Access-Control-Request-Headers", "Access-Control-Request-Method", "Connection", "Host", "User-Agent", "token"},
		AllowCredentials:       true,
		AllowWildcard:          true,
		AllowBrowserExtensions: true,
		AllowWebSockets:        true,
		AllowFiles:             true,
	}

	// corsConfig.AllowOrigins = []string{"https://example.com"}
	// // To be able to send tokens to the server.
	// corsConfig.AllowCredentials = true

	// // OPTIONS method for ReactJS
	// corsConfig.AddAllowMethods("OPTIONS")
	// corsConfig.AddAllowMethods("GET")
	// corsConfig.AddAllowMethods("POST")
	// corsConfig.AddAllowMethods("PUT")
	// corsConfig.AddAllowMethods("DELETE")
	// //corsConfig.AllowAllOrigins = true
	// corsConfig.AllowBrowserExtensions = true
	// corsConfig.AllowWebSockets = true
	// corsConfig.AllowFiles = true
	// corsConfig.AllowWildcard = true
	// corsConfig.AddAllowHeaders("Authorization")
	// corsConfig.AddAllowHeaders("Content-Type")
	// corsConfig.AddAllowHeaders("Content-Length")
	// corsConfig.AddAllowHeaders("Accept-Encoding")
	// corsConfig.AddAllowHeaders("X-CSRF-Token")
	// corsConfig.AddAllowHeaders("Authorization")
	// corsConfig.AddAllowHeaders("accept")
	// corsConfig.AddAllowHeaders("origin")
	// corsConfig.AddAllowHeaders("Cache-Control")
	// corsConfig.AddAllowHeaders("X-Requested-With")
	// corsConfig.AddAllowHeaders("Access-Control-Allow-Origin")
	// corsConfig.AddAllowHeaders("Access-Control-Allow-Headers")
	// corsConfig.AddAllowHeaders("Access-Control-Allow-Methods")
	// corsConfig.AddAllowHeaders("Access-Control-Allow-Credentials")
	// corsConfig.AddAllowHeaders("Access-Control-Max-Age")
	// corsConfig.AddAllowHeaders("Access-Control-Request-Headers")
	// corsConfig.AddAllowHeaders("Access-Control-Request-Method")
	// corsConfig.AddAllowHeaders("Connection")
	// corsConfig.AddAllowHeaders("Host")
	// corsConfig.AddAllowHeaders("User-Agent")
	// corsConfig.AddAllowHeaders("Referer")
	// corsConfig.AddAllowHeaders("Accept-Encoding")

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
	router.POST("/qr-login", func(c *gin.Context) {
		rest.QRLogIn(c, client)
	})
	router.POST("/api/qr-token", func(c *gin.Context) {
		rest.GetQRToken(c, client)
	})
	router.GET("/api/devices", func(c *gin.Context) {
		rest.GetDevices(c, client)
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
	router.POST("/api/refresh-token", func(c *gin.Context) {
		rest.RefreshToken(c, client)
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
	router.GET("/action/:token", func(c *gin.Context) {
		wshandler.Action(c, client)
	})
	router.Run(PORT) // listen and serve on
}

// move /login here
